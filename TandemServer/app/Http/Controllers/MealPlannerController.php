<?php

namespace App\Http\Controllers;

use App\Services\MealPlannerService;
use App\Http\Requests\CreateMealPlanRequest;
use App\Http\Requests\UpdateMealPlanRequest;
use App\Http\Requests\CreateMatchMealRequest;
use App\Http\Requests\RespondToMatchMealRequest;
use App\Http\Resources\MealPlanResource;
use App\Http\Resources\MatchMealResource;
use App\Models\MatchMeal;
use App\Http\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class MealPlannerController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected MealPlannerService $mealPlannerService
    ) {}

    public function getWeeklyPlan(): JsonResponse
    {
        $weekStart = request()->query('week_start');
        $plans = $this->mealPlannerService->getWeeklyPlan($weekStart);

        return $this->success([
            'plans' => MealPlanResource::collection($plans),
        ]);
    }

    public function store(CreateMealPlanRequest $request): JsonResponse
    {
        $plan = $this->mealPlannerService->create($request->getMealPlanData());

        return $this->created([
            'plan' => new MealPlanResource($plan),
        ], 'Meal plan created successfully');
    }

    public function update(UpdateMealPlanRequest $request, int $id): JsonResponse
    {
        $plan = $this->mealPlannerService->update($id, $request->getMealPlanData());

        return $this->success([
            'plan' => new MealPlanResource($plan),
        ], 'Meal plan updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $this->mealPlannerService->delete($id);

        return $this->success(null, 'Meal plan deleted successfully');
    }

    public function createMatchMeal(CreateMatchMealRequest $request): JsonResponse
    {
        $matchMeal = $this->mealPlannerService->createMatchMeal($request->getMatchMealData());

        return $this->created(
            $this->matchMealResponse($matchMeal),
            'Match meal invite sent successfully'
        );
    }

    public function respondToMatchMeal(RespondToMatchMealRequest $request, int $id): JsonResponse
    {
        $matchMeal = $this->mealPlannerService->respondToMatchMeal($id, $request->getStatus());

        return $this->success(
            $this->matchMealResponse($matchMeal),
            'Match meal response recorded successfully'
        );
    }

    protected function matchMealResponse(MatchMeal $matchMeal): array
    {
        return [
            'match_meal' => new MatchMealResource($matchMeal),
        ];
    }
}