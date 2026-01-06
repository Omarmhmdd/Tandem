<?php

namespace App\Services;

use App\Models\Habit;
use App\Models\HabitCompletion;
use App\Http\Traits\HasAuthenticatedUser;

class HabitsService
{
    use HasAuthenticatedUser;

    public function getAll(): \Illuminate\Support\Collection
    {
        $user = $this->getAuthenticatedUser();

        return Habit::where('user_id', $user->id)
            ->with('completions')
            ->orderBy('name', 'asc')
            ->get();
    }

    public function create(array $habitData): Habit
    {
        $habit = Habit::create($habitData);
        
        return $habit->load('completions');
    }

    public function update(int $id, array $habitData): Habit
    {
        $habit = $this->findHabitForUser($id);
        
        $habit->update($habitData);

        return $habit->fresh()->load('completions');
    }

    public function delete(int $id): void
    {
        $habit = $this->findHabitForUser($id);
        
        $habit->delete();
    }

    public function markCompletion(int $habitId, array $completionData): HabitCompletion
    {
        $habit = $this->findHabitForUser($habitId);

        return $this->createOrUpdateCompletion($habit, $completionData);
    }

    protected function findHabitForUser(int $id): Habit
    {
        $user = $this->getAuthenticatedUser();
        
        return Habit::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();
    }

    protected function createOrUpdateCompletion(Habit $habit, array $completionData): HabitCompletion
    {
        return HabitCompletion::updateOrCreate(
            [
                'habit_id' => $habit->id,
                'date' => $completionData['date'],
            ],
            [
                'completed' => $completionData['completed'],
                'notes' => $completionData['notes'] ?? null,
            ]
        );
    }
}