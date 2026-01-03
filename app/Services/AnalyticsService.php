<?php

namespace App\Services;

use App\Constants\AnalyticsConstants;
use App\Models\HealthLog;
use App\Models\MoodEntry;
use App\Models\Expense;
use App\Models\PantryItem;
use App\Models\Budget;
use App\Http\Traits\VerifiesResourceOwnership;
use App\Data\WeeklyAnalyticsData;
use App\Data\MonthlyMoodData;
use App\Data\PantryWasteData;
use App\Data\BudgetCategoryData;
use Illuminate\Support\Carbon;

class AnalyticsService
{
    use VerifiesResourceOwnership;

    public function getWeeklyData(?string $startDate = null, ?string $endDate = null): array
    {
        $householdMember = $this->getActiveHouseholdMemberOrNull();
        $user = $this->getAuthenticatedUser();

        if (!$householdMember) {
            return WeeklyAnalyticsData::empty();
        }

        $startDate = $startDate ?? now()->startOfWeek()->format('Y-m-d');
        $endDate = $endDate ?? now()->endOfWeek()->format('Y-m-d');

        $partner = $this->getPartner();

        $userLogs = $this->getHealthLogsForDateRange($user->id, $startDate, $endDate);
        $partnerLogs = $partner ? $this->getHealthLogsForDateRange($partner->user_id, $startDate, $endDate) : collect([]);

        $userMoods = $this->getMoodEntriesForDateRange($user->id, $startDate, $endDate);
        $partnerMoods = $partner ? $this->getMoodEntriesForDateRange($partner->user_id, $startDate, $endDate) : collect([]);

        return $this->buildWeeklyData($startDate, $endDate, $userLogs, $partnerLogs, $userMoods, $partnerMoods);
    }

    public function getMonthlyMoodData(?int $year = null, ?int $month = null): array
    {
        $householdMember = $this->getActiveHouseholdMemberOrNull();
        $user = $this->getAuthenticatedUser();

        if (!$householdMember) {
            return [];
        }

        $year = $year ?? now()->year;
        $month = $month ?? now()->month;

        $partner = $this->getPartner();

        $userMoods = $this->getMoodEntriesForYearMonth($user->id, $year, $month);
        $partnerMoods = $partner ? $this->getMoodEntriesForYearMonth($partner->user_id, $year, $month) : collect([]);

        $userAvg = $this->calculateAverageMood($userMoods);
        $partnerAvg = $this->calculateAverageMood($partnerMoods);

        $monthName = AnalyticsConstants::MONTH_NAMES[$month - 1];

        return [
            MonthlyMoodData::entry($monthName, $userAvg, $partnerAvg)
        ];
    }

    public function getPantryWasteData(?string $startDate = null, ?string $endDate = null): array
    {
        $householdMember = $this->getActiveHouseholdMemberOrNull();

        if (!$householdMember) {
            return PantryWasteData::empty();
        }

        $startDate = $startDate ?? now()->subDays(AnalyticsConstants::MOOD_ANNOTATION_DAYS)->format('Y-m-d');
        $endDate = $endDate ?? now()->format('Y-m-d');

        $expiredItems = $this->getExpiredPantryItems($householdMember->household_id, $startDate, $endDate);

        return PantryWasteData::calculate($expiredItems->count());
    }

    public function getBudgetCategoriesData(?int $year = null, ?int $month = null): array
    {
        $householdMember = $this->getActiveHouseholdMemberOrNull();

        if (!$householdMember) {
            return [];
        }

        $year = $year ?? now()->year;
        $month = $month ?? now()->month;

        $expenses = $this->getExpensesForYearMonth($householdMember->household_id, $year, $month);
        $categoryTotals = $this->groupExpensesByCategory($expenses);

        return $this->buildBudgetCategoriesResult($categoryTotals);
    }

    protected function getHealthLogsForDateRange(int $userId, string $startDate, string $endDate)
    {
        return HealthLog::where('user_id', $userId)
            ->whereBetween('date', [$startDate, $endDate])
            ->get();
    }

    protected function getMoodEntriesForDateRange(int $userId, string $startDate, string $endDate)
    {
        return MoodEntry::where('user_id', $userId)
            ->whereBetween('date', [$startDate, $endDate])
            ->get();
    }

    protected function getMoodEntriesForYearMonth(int $userId, int $year, int $month)
    {
        return MoodEntry::where('user_id', $userId)
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->get();
    }

    protected function getExpiredPantryItems(int $householdId, string $startDate, string $endDate)
    {
        return PantryItem::where('household_id', $householdId)
            ->whereNotNull('expiry_date')
            ->whereBetween('expiry_date', [$startDate, $endDate])
            ->whereNotNull('deleted_at')
            ->withTrashed()
            ->get();
    }

    protected function getExpensesForYearMonth(int $householdId, int $year, int $month)
    {
        return Expense::where('household_id', $householdId)
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->get();
    }

    protected function groupExpensesByCategory($expenses)
    {
        return $expenses->groupBy('category')->map(function ($items) {
            return $items->sum('amount');
        });
    }

    protected function buildWeeklyData(
        string $startDate,
        string $endDate,
        $userLogs,
        $partnerLogs,
        $userMoods,
        $partnerMoods
    ): array {
        $result = WeeklyAnalyticsData::empty();

        $currentDate = Carbon::parse($startDate);
        $endDateTime = Carbon::parse($endDate);

        while ($currentDate->lte($endDateTime)) {
            $dateStr = $currentDate->format('Y-m-d');
            $dayName = AnalyticsConstants::DAY_NAMES[$currentDate->format('N') - 1];

            $dayData = $this->buildWeeklyDayData(
                $dayName,
                $dateStr,
                $userLogs,
                $partnerLogs,
                $userMoods,
                $partnerMoods
            );

            $result['steps'][] = $dayData['steps'];
            $result['sleep'][] = $dayData['sleep'];
            
            if ($dayData['mood'] !== null) {
                $result['mood'][] = $dayData['mood'];
            }

            $currentDate->addDay();
        }

        return $result;
    }

    protected function buildWeeklyDayData(
        string $dayName,
        string $dateStr,
        $userLogs,
        $partnerLogs,
        $userMoods,
        $partnerMoods
    ): array {
        // Get all mood entries for this date
        $dayUserMoods = $this->filterMoodsByDate($userMoods, $dateStr);
        $dayPartnerMoods = $partnerMoods->isNotEmpty() ? $this->filterMoodsByDate($partnerMoods, $dateStr) : collect([]);

        // Calculate average mood for the day
        $userMoodValue = null;
        if ($dayUserMoods->isNotEmpty()) {
            $average = $dayUserMoods->avg(function ($mood) {
                return $this->getMoodValue($mood->mood);
            });
            $userMoodValue = round($average, 1);
        }

        $partnerMoodValue = null;
        if ($dayPartnerMoods->isNotEmpty()) {
            $average = $dayPartnerMoods->avg(function ($mood) {
                return $this->getMoodValue($mood->mood);
            });
            $partnerMoodValue = round($average, 1);
        }

        $dayUserLogs = $this->filterLogsByDate($userLogs, $dateStr);
        $dayPartnerLogs = $partnerLogs->isNotEmpty() ? $this->filterLogsByDate($partnerLogs, $dateStr) : collect([]);

        $userSteps = $this->extractStepsFromLogs($dayUserLogs);
        $partnerSteps = $dayPartnerLogs->isNotEmpty() ? $this->extractStepsFromLogs($dayPartnerLogs) : 0;

        $sleepHours = $dayUserLogs->isNotEmpty() ? $dayUserLogs->avg('sleep_hours') : null;

        return [
            'steps' => WeeklyAnalyticsData::stepsEntry($dayName, $userSteps, $partnerSteps),
            'sleep' => WeeklyAnalyticsData::sleepEntry($dayName, $sleepHours),
            'mood' => ($userMoodValue !== null || $partnerMoodValue !== null) 
                ? WeeklyAnalyticsData::moodEntry($dayName, $userMoodValue, $partnerMoodValue) 
                : null,
        ];
    }

    protected function findMoodByDate($moods, string $dateStr)
    {
        return $moods->first(function ($mood) use ($dateStr) {
            return $this->formatDateForComparison($mood->date) === $dateStr;
        });
    }

    protected function filterMoodsByDate($moods, string $dateStr)
    {
        return $moods->filter(function ($mood) use ($dateStr) {
            return $this->formatDateForComparison($mood->date) === $dateStr;
        });
    }

    protected function filterLogsByDate($logs, string $dateStr)
    {
        return $logs->filter(function ($log) use ($dateStr) {
            return $this->formatDateForComparison($log->date) === $dateStr;
        });
    }

    protected function formatDateForComparison($date): string
    {
        if ($date instanceof Carbon || $date instanceof \DateTime) {
            return $date->format('Y-m-d');
        }

        if (is_string($date)) {
            return $date;
        }

        return Carbon::parse($date)->format('Y-m-d');
    }

    protected function extractStepsFromLogs($logs): int
    {
        $totalSteps = 0;

        foreach ($logs as $log) {
            if (!isset($log->activities) || !$log->activities) {
                continue;
            }

            $activities = is_array($log->activities) 
                ? $log->activities 
                : json_decode($log->activities, true) ?? [];

            foreach ($activities as $activity) {
                $steps = $this->extractStepsFromActivity($activity);
                $totalSteps += $steps;
            }
        }

        return $totalSteps;
    }

    protected function extractStepsFromActivity($activity): int
    {
        $activityStr = is_string($activity) ? $activity : (string)$activity;
        
        if (stripos($activityStr, 'step') === false && stripos($activityStr, 'walk') === false) {
            return 0;
        }

        if (preg_match('/(\d+)/', $activityStr, $matches)) {
            return (int)$matches[1];
        }

        return 0;
    }

    protected function getMoodValue(string $mood): int
    {
        return AnalyticsConstants::MOOD_VALUES[$mood] ?? AnalyticsConstants::DEFAULT_MOOD_VALUE;
    }

    protected function calculateAverageMood($moods): ?float
    {
        if ($moods->isEmpty()) {
            return null;
        }

        $average = $moods->avg(function ($mood) {
            return $this->getMoodValue($mood->mood);
        });

        return $average ? round($average, 1) : null;
    }

    protected function buildBudgetCategoriesResult($categoryTotals): array
    {
        $result = [];
        
        foreach ($categoryTotals as $category => $amount) {
            $result[] = BudgetCategoryData::entry($category, (float) $amount);
        }

        return $result;
    }
}