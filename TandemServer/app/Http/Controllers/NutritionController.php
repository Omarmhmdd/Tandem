<?php

namespace App\Http\Controllers;

use App\Services\NutritionService;
use App\Http\Resources\NutritionRecommendationResource;
use App\Http\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class NutritionController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected NutritionService $nutritionService
    ) {}

    // Gets nutrition recommendations for user and partner
    // Calculates intake from food logs and compares to targets
    public function recommendations(): JsonResponse
    {
        $result = $this->nutritionService->getNutritionRecommendations();

        return $this->success([
            'nutrition' => new NutritionRecommendationResource($result),
        ]);
    }
}