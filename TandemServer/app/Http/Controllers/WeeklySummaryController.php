<?php

namespace App\Http\Controllers;

use App\Services\WeeklySummaryService;
use App\Http\Resources\WeeklySummaryResource;
use App\Http\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\GenerateWeeklySummaryRequest;
class WeeklySummaryController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected WeeklySummaryService $weeklySummaryService
    ) {}

    public function index(): JsonResponse
    {
        $summaries = $this->weeklySummaryService->getAll();

        return $this->success([
            'summaries' => WeeklySummaryResource::collection($summaries),
        ]);
    }

    public function generate(GenerateWeeklySummaryRequest $request): JsonResponse
    {
        $summary = $this->weeklySummaryService->generate($request->getWeekStart());

        return $this->created([
            'summary' => new WeeklySummaryResource($summary),
        ], 'Weekly summary generated successfully');
    }

    public function generateForHousehold(int $householdId): JsonResponse
{
    $summary = $this->weeklySummaryService->generateForHousehold($householdId);

    return $this->created([
        'summary' => new WeeklySummaryResource($summary),
    ], 'Weekly summary generated successfully');
}
}