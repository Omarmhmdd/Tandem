<?php

namespace App\Http\Controllers;

use App\Services\HabitsService;
use App\Http\Requests\CreateHabitRequest;
use App\Http\Requests\UpdateHabitRequest;
use App\Http\Requests\CompleteHabitRequest;
use App\Http\Resources\HabitResource;
use App\Http\Resources\HabitCompletionResource;
use App\Http\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class HabitsController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected HabitsService $habitsService
    ) {}

    public function index(): JsonResponse
    {
        $habits = $this->habitsService->getAll();

        return $this->success([
            'habits' => HabitResource::collection($habits),
        ]);
    }

    public function store(CreateHabitRequest $request): JsonResponse
    {
        $habit = $this->habitsService->create($request->getHabitData());

        return $this->created([
            'habit' => new HabitResource($habit),
        ], 'Habit created successfully');
    }

    public function update(UpdateHabitRequest $request, int $id): JsonResponse
    {
        $habit = $this->habitsService->update($id, $request->getHabitData());

        return $this->success([
            'habit' => new HabitResource($habit),
        ], 'Habit updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $this->habitsService->delete($id);

        return $this->success(null, 'Habit deleted successfully');
    }

    public function markCompletion(CompleteHabitRequest $request, int $id): JsonResponse
    {
        $completion = $this->habitsService->markCompletion($id, $request->getCompletionData());

        return $this->success([
            'completion' => new HabitCompletionResource($completion),
        ], 'Habit completion recorded successfully');
    }
}