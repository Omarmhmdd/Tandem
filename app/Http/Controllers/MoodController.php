<?php

namespace App\Http\Controllers;

use App\Http\Requests\DateRangeRequest;
use App\Services\MoodService;
use App\Http\Requests\CreateMoodEntryRequest;
use App\Http\Resources\MoodEntryResource;
use App\Http\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class MoodController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected MoodService $moodService
    ) {}

    public function getTimeline(DateRangeRequest $request): JsonResponse
    {
        $entries = $this->moodService->getTimeline(
            $request->getStartDate(),
            $request->getEndDate()
        );

        return $this->success([
            'entries' => MoodEntryResource::collection($entries),
        ]);
    }

    public function getComparison(DateRangeRequest $request): JsonResponse
    {
        $comparison = $this->moodService->getComparison(
            $request->getStartDate(),
            $request->getEndDate()
        );

        return $this->success([
            'user' => MoodEntryResource::collection($comparison['user']),
            'partner' => MoodEntryResource::collection($comparison['partner']),
        ]);
    }

    public function createEntry(CreateMoodEntryRequest $request): JsonResponse
    {
        $entry = $this->moodService->createEntry($request->getMoodEntryData());

        return $this->created([
            'entry' => new MoodEntryResource($entry),
        ], 'Mood entry created successfully');
    }
}