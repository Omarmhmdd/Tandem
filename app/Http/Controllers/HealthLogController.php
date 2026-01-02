<?php

namespace App\Http\Controllers;

use App\Http\Requests\DateRangeRequest;
use App\Services\HealthLogService;
use App\Http\Requests\CreateHealthLogRequest;
use App\Http\Resources\HealthLogResource;
use App\Http\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;



class HealthLogController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected HealthLogService $healthLogService
    ) {}

    public function index(DateRangeRequest $request): JsonResponse
    {
        $logs = $this->healthLogService->getAll(
            $request->getStartDate(),
            $request->getEndDate()
        );

        return $this->success([
            'logs' => HealthLogResource::collection($logs),
        ]);
    }

    public function store(CreateHealthLogRequest $request): JsonResponse
    {
        $log = $this->healthLogService->create($request->getHealthLogData());

        return $this->created([
            'log' => new HealthLogResource($log),
        ], 'Health log created successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $this->healthLogService->delete($id);

        return $this->success(null, 'Health log deleted successfully');
    }
}

