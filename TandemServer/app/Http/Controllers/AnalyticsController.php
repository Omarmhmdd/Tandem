<?php

namespace App\Http\Controllers;

use App\Http\Requests\DateRangeRequest;
use App\Http\Requests\YearMonthRequest;
use App\Http\Requests\GetAggregatedAnalyticsRequest;
use App\Services\AnalyticsService;
use App\Data\AnalyticsAggregatedRequestData;
use App\Http\Resources\GoalResource;
use App\Http\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use App\Models\Household;
class AnalyticsController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected AnalyticsService $analyticsService
    ) {}

    public function getWeekly(DateRangeRequest $request): JsonResponse
    {
        $data = $this->analyticsService->getWeeklyData(
            $request->getStartDate(),
            $request->getEndDate()
        );

        return $this->success($data);
    }

    public function getMonthlyMood(YearMonthRequest $request): JsonResponse
    {
        $data = $this->analyticsService->getMonthlyMoodData(
            $request->getYear(),
            $request->getMonth()
        );

        return $this->success([
            'mood' => $data,
        ]);
    }

    public function getPantryWaste(DateRangeRequest $request): JsonResponse
    {
        $data = $this->analyticsService->getPantryWasteData(
            $request->getStartDate(),
            $request->getEndDate()
        );

        return $this->success($data);
    }

    public function getBudgetCategories(YearMonthRequest $request): JsonResponse
    {
        $data = $this->analyticsService->getBudgetCategoriesData(
            $request->getYear(),
            $request->getMonth()
        );

        return $this->success([
            'categories' => $data,
        ]);
    }

    
    public function getAggregated(GetAggregatedAnalyticsRequest $request): JsonResponse
    {
        $requestData = AnalyticsAggregatedRequestData::fromArray($request->toDataArray());
        
        $responseData = $this->analyticsService->getAggregatedAnalyticsData($requestData);
        
        $responseArray = $responseData->toArray();
        
        
        $responseArray['goals'] = GoalResource::collection($responseData->goals);

        return $this->success($responseArray);
    }



  public function getAggregatedForHousehold(int $household_id): JsonResponse
{
    // Get household with members
    $household = Household::with('members.user')->find($household_id);
    
    if (!$household) {
        return $this->error('Household not found', 404);
    }

    // Get query parameters with defaults
    $currentYear = request()->query('current_year', now()->year);
    $currentMonth = request()->query('current_month', now()->month);
    $weekStart = request()->query('week_start', now()->startOfWeek()->format('Y-m-d'));
    $weekEnd = request()->query('week_end', now()->endOfWeek()->format('Y-m-d'));

    // Get user IDs from household members
    $userIds = $household->members->pluck('user_id')->toArray();

    // Fetch real data directly from database
    // Goals use household_id
    $goals = \App\Models\Goal::where('household_id', $household_id)->get();
    
    // Budget uses household_id
    $budget = \App\Models\Budget::where('household_id', $household_id)
        ->where('year', $currentYear)
        ->where('month', $currentMonth)
        ->first();
    
    // Expenses use user_id
    $totalSpent = \App\Models\Expense::whereIn('user_id', $userIds)
        ->whereYear('created_at', $currentYear)
        ->whereMonth('created_at', $currentMonth)
        ->sum('amount');

    $healthLogs = \App\Models\HealthLog::whereIn('user_id', $userIds)
        ->whereBetween('date', [$weekStart, $weekEnd])
        ->get();

    $moodEntries = \App\Models\MoodEntry::whereIn('user_id', $userIds)
        ->whereBetween('date', [$weekStart, $weekEnd])
        ->get();

    // Format weekly health data with dates
    $weeklySteps = $healthLogs->map(function($log) {
        return [
            'date' => $log->date,
            'count' => $log->steps
        ];
    })->filter(function($item) {
        return $item['count'] !== null;
    })->values();

    $weeklySleep = $healthLogs->map(function($log) {
        return [
            'date' => $log->date,
            'hours' => $log->sleep_hours
        ];
    })->filter(function($item) {
        return $item['hours'] !== null;
    })->values();

    $weeklyMood = $moodEntries->map(function($entry) {
        return [
            'date' => $entry->date,
            'score' => $entry->mood_score ?? 5
        ];
    })->filter(function($item) {
        return $item['score'] !== null;
    })->values();

    // Get budget categories
    $budgetCategories = \App\Models\Expense::whereIn('user_id', $userIds)
        ->whereYear('created_at', $currentYear)
        ->whereMonth('created_at', $currentMonth)
        ->selectRaw('category, SUM(amount) as amount')
        ->groupBy('category')
        ->get()
        ->map(function($item) {
            return [
                'category' => $item->category,
                'amount' => $item->amount
            ];
        });

    // Pantry waste - not implemented yet
    $pantryWaste = [];

    // Build response with real data
    return $this->success([
        'household_id' => $household_id,
        'weekly' => [
            'steps' => $weeklySteps,
            'sleep' => $weeklySleep,
            'mood' => $weeklyMood
        ],
        'monthlyMood' => $moodEntries->groupBy('mood')->map->count(),
        'pantryWaste' => $pantryWaste,
        'budgetCategories' => $budgetCategories,
        'goals' => GoalResource::collection($goals),
        'budgetSummary' => [
            'monthly_budget' => $budget->monthly_budget ?? 0,
            'total_spent' => $totalSpent,
            'remaining' => ($budget->monthly_budget ?? 0) - $totalSpent
        ]
    ]);

    }
}