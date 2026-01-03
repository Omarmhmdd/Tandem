<?php

namespace App\Http\Controllers;

use App\Services\WeeklySummaryService;
use App\Http\Resources\WeeklySummaryResource;
use App\Http\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

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
}