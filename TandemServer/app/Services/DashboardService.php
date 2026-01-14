<?php

namespace App\Services;

use App\Http\Traits\VerifiesResourceOwnership;
use Illuminate\Support\Collection;

class DashboardService
{
    use VerifiesResourceOwnership;

    public function __construct(
        private PantryService $pantryService,
        private GoalsService $goalsService,
        private HealthLogService $healthLogService,
        private MealPlannerService $mealPlannerService,
        private HouseholdService $householdService,
        private WeeklySummaryService $weeklySummaryService
    ) {}

    
    public function getDashboardData(): array
    {
        $householdMember = $this->getActiveHouseholdMemberOrNull();
        
        // If no household, return empty collections for household-specific data
        if (!$householdMember) {
            return [
                'pantryItems' => collect([]),
                'goals' => $this->goalsService->getAll(), // Goals can be user-specific
                'healthLogs' => $this->healthLogService->getAll(), // Health logs are user-specific
                'mealPlans' => collect([]),
                'members' => collect([]),
                'weeklySummaries' => collect([]),
            ];
        }

        // Get current week start for meal plans
        $weekStart = now()->startOfWeek()->format('Y-m-d');

        return [
            'pantryItems' => $this->pantryService->getAll(),
            'goals' => $this->goalsService->getAll(),
            'healthLogs' => $this->healthLogService->getAll(),
            'mealPlans' => $this->mealPlannerService->getWeeklyPlan($weekStart),
            'members' => $this->householdService->getMembers($householdMember->household_id),
            'weeklySummaries' => $this->weeklySummaryService->getAll(),
        ];
    }
}

