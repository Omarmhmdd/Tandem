<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use App\Http\Resources\PantryItemResource;
use App\Http\Resources\GoalResource;
use App\Http\Resources\HealthLogResource;
use App\Http\Resources\MealPlanResource;
use App\Http\Resources\HouseholdMemberResource;
use App\Http\Resources\WeeklySummaryResource;
use App\Http\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected DashboardService $dashboardService
    ) {}

    public function index(): JsonResponse
    {
        $data = $this->dashboardService->getDashboardData();

        return $this->success([
            'items' => PantryItemResource::collection($data['pantryItems']),
            'goals' => GoalResource::collection($data['goals']),
            'logs' => HealthLogResource::collection($data['healthLogs']),
            'plans' => MealPlanResource::collection($data['mealPlans']),
            'members' => HouseholdMemberResource::collection($data['members']),
            'summaries' => WeeklySummaryResource::collection($data['weeklySummaries']),
        ]);
    }
}

