<?php

namespace App\Data;

use App\Models\HealthLog;
use App\Models\PantryItem;
use App\Models\Recipe;
use App\Models\Goal;
use App\Models\MoodEntry;
use App\Models\Expense;
use App\Models\Budget;
use App\Models\Habit;

class WeeklySummaryData
{
    
    public static function collectWeekData(int $householdId, string $weekStart, string $weekEnd): array
    {
        return [
            'healthLogs' => self::getHealthLogsForWeek($householdId, $weekStart, $weekEnd),
            'pantryItems' => self::getPantryItems($householdId),
            'recipes' => self::getRecipesUsed($householdId, $weekStart, $weekEnd),
            'goals' => self::getGoals($householdId),
            'moodData' => self::getMoodData($householdId, $weekStart, $weekEnd),
            'budgetData' => self::getBudgetData($householdId, $weekStart, $weekEnd),
            'habits' => self::getHabitsData($householdId, $weekStart, $weekEnd),
        ];
    }


    public static function buildWeeklySummaryData(int $householdId, string $weekStart, array $validated): array
    {
        return [
            'household_id' => $householdId,
            'week_start' => $weekStart,
            'highlight' => $validated['highlight'] ?? '',
            'bullets' => $validated['bullets'] ?? [],
            'action' => $validated['action'] ?? '',
            'generated_at' => now(),
        ];
    }

    
    private static function getHealthLogsForWeek(int $householdId, string $weekStart, string $weekEnd): array
    {
        return HealthLog::whereHas('user.householdMembers', function ($q) use ($householdId) {
            $q->where('household_id', $householdId)->where('status', 'active');
        })
        ->with('user')
        ->whereBetween('date', [$weekStart, $weekEnd])
        ->get()
        ->map(fn($log) => [
            'date' => $log->date ? \Carbon\Carbon::parse($log->date)->format('Y-m-d') : null,
            'user_id' => $log->user_id,
            'user_name' => $log->user->first_name ?? 'Unknown',
            'activities' => $log->activities ?? [],
            'food' => $log->food ?? [],
            'sleep_hours' => $log->sleep_hours,
            'mood' => $log->mood,
            'notes' => $log->notes,
        ])
        ->toArray();
    }


    private static function getPantryItems(int $householdId): array
    {
        $today = now()->startOfDay();
        $sevenDaysFromNow = now()->addDays(7)->endOfDay();
        
        return PantryItem::where('household_id', $householdId)
            ->get()
            ->map(function ($item) use ($today, $sevenDaysFromNow) {
                $expiryDate = $item->expiry_date;
                $formattedDate = null;
                $isExpiringSoon = false;
                $daysUntilExpiry = null;
                
                if ($expiryDate instanceof \Carbon\Carbon) {
                    $formattedDate = $expiryDate->format('Y-m-d');
                    // Check if expiring within 7 days
                    if ($expiryDate >= $today && $expiryDate <= $sevenDaysFromNow) {
                        $isExpiringSoon = true;
                        $daysUntilExpiry = $today->diffInDays($expiryDate, false);
                    }
                }
                
                return [
                    'name' => $item->name,
                    'expiry_date' => $formattedDate,
                    'is_expiring_soon' => $isExpiringSoon,
                    'days_until_expiry' => $daysUntilExpiry,
                ];
            })
            ->toArray();
    }

    private static function getRecipesUsed(int $householdId, string $weekStart, string $weekEnd): array
    {
        return Recipe::where('household_id', $householdId)
            ->whereHas('mealPlans', function ($q) use ($weekStart, $weekEnd) {
                $q->whereBetween('date', [$weekStart, $weekEnd]);
            })
            ->get()
            ->map(fn($recipe) => [
                'id' => $recipe->id,
                'name' => $recipe->name,
            ])
            ->toArray();
    }


    private static function getGoals(int $householdId): array
    {
        return Goal::where(function ($q) use ($householdId) {
            $q->where('household_id', $householdId)
                ->orWhereHas('user.householdMembers', function ($q) use ($householdId) {
                    $q->where('household_id', $householdId)->where('status', 'active');
                });
        })
        ->with(['user', 'milestones'])
        ->get()
        ->map(function($goal) {
            $progressPercentage = $goal->target > 0 
                ? round(($goal->current / $goal->target) * 100, 1) 
                : 0;
            
            // Goal is completed ONLY if: progress >= 100% AND all milestones are completed (if any)
            $isProgressComplete = $progressPercentage >= 100;
            $hasMilestones = $goal->milestones->count() > 0;
            $allMilestonesComplete = !$hasMilestones || $goal->milestones->every(function ($milestone) {
                return $milestone->completed;
            });
            $isCompleted = $isProgressComplete && $allMilestonesComplete;
            
            return [
                'title' => $goal->title,
                'current' => $goal->current,
                'target' => $goal->target,
                'progress_percentage' => $progressPercentage,
                'is_completed' => $isCompleted,
                'completed_at' => $goal->completed_at ? $goal->completed_at->format('Y-m-d') : null,
                'user_id' => $goal->user_id,
                'user_name' => $goal->user ? ($goal->user->first_name ?? 'Unknown') : 'Household',
                'household_id' => $goal->household_id,
            ];
        })
        ->toArray();
    }


    private static function getMoodData(int $householdId, string $weekStart, string $weekEnd): array
    {
        return MoodEntry::whereIn('user_id', function ($q) use ($householdId) {
            $q->select('user_id')
                ->from('household_members')
                ->where('household_id', $householdId)
                ->where('status', 'active');
        })
        ->with('user')
        ->whereBetween('date', [$weekStart, $weekEnd])
        ->get()
        ->map(fn($entry) => [
            'date' => $entry->date ? \Carbon\Carbon::parse($entry->date)->format('Y-m-d') : null,
            'user_id' => $entry->user_id,
            'user_name' => $entry->user->first_name ?? 'Unknown',
            'mood' => $entry->mood,
        ])
        ->toArray();
    }


    private static function getBudgetData(int $householdId, string $weekStart, string $weekEnd): array
    {
        $budget = Budget::where('household_id', $householdId)->first();
        $monthlyBudget = $budget?->monthly_budget ?? 0;
        
        // Get the month and year from the week
        $weekDate = \Carbon\Carbon::parse($weekStart);
        $month = $weekDate->month;
        $year = $weekDate->year;
        
        // Get total expenses for the ENTIRE MONTH
        $totalMonthlyExpenses = Expense::where('household_id', $householdId)
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->sum('amount');

        // Get weekly expenses for this specific week
        $weeklyExpenses = Expense::where('household_id', $householdId)
            ->whereBetween('date', [$weekStart, $weekEnd])
            ->with('user')
            ->get();
        
        $totalWeeklyExpenses = $weeklyExpenses->sum('amount');
        
        // Group weekly expenses by user for individual breakdown
        $expensesByUser = [];
        foreach ($weeklyExpenses as $expense) {
            $userId = $expense->user_id;
            $userName = $expense->user->first_name ?? 'Unknown';
            
            if (!isset($expensesByUser[$userId])) {
                $expensesByUser[$userId] = [
                    'name' => $userName,
                    'total' => 0,
                ];
            }
            
            $expensesByUser[$userId]['total'] += (float)$expense->amount;
        }
        
        // Calculate remaining monthly budget
        $remainingMonthly = $monthlyBudget - $totalMonthlyExpenses;
        
        return [
            'monthly_budget' => $monthlyBudget,
            'monthly_expenses' => $totalMonthlyExpenses,
            'weekly_expenses' => $totalWeeklyExpenses,
            'remaining_monthly' => $remainingMonthly,
            'expenses_by_user' => array_values($expensesByUser),
            'month' => $month,
            'year' => $year,
        ];
    }

    private static function getHabitsData(int $householdId, string $weekStart, string $weekEnd): array
    {
        // Get all habits for household members
        $userIds = \App\Models\HouseholdMember::where('household_id', $householdId)
            ->where('status', 'active')
            ->pluck('user_id')
            ->toArray();

        $habits = Habit::whereIn('user_id', $userIds)
            ->with(['user', 'completions' => function ($q) use ($weekStart, $weekEnd) {
                $q->whereBetween('date', [$weekStart, $weekEnd]);
            }])
            ->get();

        return $habits->map(function ($habit) {
            $completions = $habit->completions;
            $completedCount = $completions->where('completed', true)->count();
            $totalCount = $completions->count();
            $completionRate = $totalCount > 0 ? round(($completedCount / $totalCount) * 100, 1) : 0;

            return [
                'id' => $habit->id,
                'name' => $habit->name,
                'user_id' => $habit->user_id,
                'user_name' => $habit->user->first_name ?? 'Unknown',
                'frequency' => $habit->frequency,
                'completed_count' => $completedCount,
                'total_count' => $totalCount,
                'completion_rate' => $completionRate,
            ];
        })->toArray();
    }
}

