<?php

namespace App\Http\Controllers;

use App\Services\NutritionTargetService;
use App\Http\Requests\UpdateNutritionTargetRequest;
use App\Data\NutritionTargetData;
use App\Http\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class NutritionTargetController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected NutritionTargetService $nutritionTargetService
    ) {}

    public function getTarget(): JsonResponse
    {
        $target = $this->nutritionTargetService->getTarget();

        return $this->success([
            'target' => NutritionTargetData::toArray($target),
        ]);
    }

    public function updateTarget(UpdateNutritionTargetRequest $request): JsonResponse
    {
        $existingTarget = $this->nutritionTargetService->getTarget();
        $wasCreated = $existingTarget === null;
        
        $target = $this->nutritionTargetService->updateTarget($request->getTargetData());
        
        $message = $wasCreated 
            ? 'Nutrition target created successfully' 
            : 'Nutrition target updated successfully';
        
        return $this->success([
            'target' => NutritionTargetData::toArray($target),
        ], $message);
    }

}