<?php

namespace App\Http\Controllers;

use App\Services\AiCoachService;
use App\Http\Requests\AiCoachQueryRequest;
use App\Http\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class AiCoachController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected AiCoachService $aiCoachService
    ) {}

    public function query(AiCoachQueryRequest $request): JsonResponse
    {
        $result = $this->aiCoachService->query($request->getQuestion());

        return $this->success($result);
    }
}