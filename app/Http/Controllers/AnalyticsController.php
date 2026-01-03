<?php

namespace App\Http\Controllers;

use App\Http\Requests\DateRangeRequest;
use App\Http\Requests\YearMonthRequest;
use App\Services\AnalyticsService;
use App\Http\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected AnalyticsService $analyticsService
    ) {}

    public function getWeekly(DateRangeRequest $request): JsonResponse
    {
        $data = $this->analyticsService->getWeeklyData(
            $request->getStartDate(),
            $request->getEndDate()
        );

        return $this->success($data);
    }

    public function getMonthlyMood(YearMonthRequest $request): JsonResponse
    {
        $data = $this->analyticsService->getMonthlyMoodData(
            $request->getYear(),
            $request->getMonth()
        );

        return $this->success([
            'mood' => $data,
        ]);
    }

    public function getPantryWaste(DateRangeRequest $request): JsonResponse
    {
        $data = $this->analyticsService->getPantryWasteData(
            $request->getStartDate(),
            $request->getEndDate()
        );

        return $this->success($data);
    }

    public function getBudgetCategories(YearMonthRequest $request): JsonResponse
    {
        $data = $this->analyticsService->getBudgetCategoriesData(
            $request->getYear(),
            $request->getMonth()
        );

        return $this->success([
            'categories' => $data,
        ]);
    }
}


