<?php

namespace App\Http\Controllers;

use App\Http\Requests\GenerateDateNightRequest;
use App\Services\DateNightService;
use App\Http\Resources\DateNightSuggestionResource;
use App\Http\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class DateNightController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected DateNightService $dateNightService
    ) {}

    public function index(): JsonResponse
    {
        $suggestions = $this->dateNightService->getSuggestions();

        return $this->success([
            'suggestions' => DateNightSuggestionResource::collection($suggestions),
        ]);
    }

    public function generate(GenerateDateNightRequest $request): JsonResponse
    {
        $suggestion = $this->dateNightService->generate(
            $request->getSuggestedAt(),
            $request->getBudget()
        );

        return $this->created([
            'suggestion' => new DateNightSuggestionResource($suggestion),
        ], 'Date night suggestion generated successfully');
    }

    public function accept(int $id): JsonResponse
    {
        $suggestion = $this->dateNightService->acceptSuggestion($id);

        return $this->success([
            'suggestion' => new DateNightSuggestionResource($suggestion),
        ], 'Date night suggestion accepted successfully. Meal added to meal plan and expense recorded.');
    }
}

