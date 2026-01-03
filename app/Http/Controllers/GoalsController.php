<?php

namespace App\Http\Controllers;

use App\Services\GoalsService;
use App\Http\Requests\CreateGoalRequest;
use App\Http\Requests\UpdateGoalRequest;
use App\Http\Requests\UpdateProgressRequest;
use App\Http\Requests\CreateMilestoneRequest;
use App\Http\Requests\UpdateMilestoneRequest;
use App\Http\Resources\GoalResource;
use App\Http\Resources\GoalMilestoneResource;
use App\Http\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class GoalsController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected GoalsService $goalsService
    ) {}

    public function index(): JsonResponse
    {
        $goals = $this->goalsService->getAll();

        return $this->success([
            'goals' => GoalResource::collection($goals),
        ]);
    }

    public function store(CreateGoalRequest $request): JsonResponse
    {
        $goal = $this->goalsService->create($request->getGoalData());

        return $this->created([
            'goal' => new GoalResource($goal),
        ], 'Goal created successfully');
    }

    public function update(UpdateGoalRequest $request, int $id): JsonResponse
    {
        $goal = $this->goalsService->update($id, $request->getGoalData());

        return $this->success([
            'goal' => new GoalResource($goal),
        ], 'Goal updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $this->goalsService->delete($id);

        return $this->success(null, 'Goal deleted successfully');
    }

    public function updateProgress(UpdateProgressRequest $request, int $id): JsonResponse
    {
        $goal = $this->goalsService->updateProgress($id, $request->getCurrent());

        return $this->success([
            'goal' => new GoalResource($goal),
        ], 'Progress updated successfully');
    }

    public function createMilestone(CreateMilestoneRequest $request, int $id): JsonResponse
    {
        $milestone = $this->goalsService->createMilestone($id, $request->getMilestoneData($id));

        return $this->created([
            'milestone' => new GoalMilestoneResource($milestone),
        ], 'Milestone created successfully');
    }

    public function updateMilestone(UpdateMilestoneRequest $request, int $id, int $milestoneId): JsonResponse
    {
        $milestone = $this->goalsService->updateMilestone($id, $milestoneId, $request->getMilestoneData());

        return $this->success([
            'milestone' => new GoalMilestoneResource($milestone),
        ], 'Milestone updated successfully');
    }

    public function deleteMilestone(int $id, int $milestoneId): JsonResponse
    {
        $this->goalsService->deleteMilestone($id, $milestoneId);

        return $this->success(null, 'Milestone deleted successfully');
    }
}