<?php

namespace App\Http\Controllers;

use App\Http\Requests\GenerateDateNightRequest;
use App\Http\Requests\AcceptDateNightRequest;
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
        $acceptedDateNights = $this->dateNightService->getAcceptedDateNights();

        return $this->success([
            'suggestions' => DateNightSuggestionResource::collection($suggestions),
            'accepted_date_nights' => DateNightSuggestionResource::collection($acceptedDateNights),
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

    public function accept(int $id, AcceptDateNightRequest $request): JsonResponse
    {
        $suggestion = $this->dateNightService->acceptSuggestion($id, $request->getDate());

        return $this->success([
            'suggestion' => new DateNightSuggestionResource($suggestion),
        ], 'Date night suggestion accepted successfully. Meal added to meal plan and expense recorded.');
    }
}

