<?php

namespace App\Services;

use App\Models\Goal;
use App\Models\GoalMilestone;
use App\Http\Traits\VerifiesResourceOwnership;
use Illuminate\Support\Collection;

class GoalsService
{
    use VerifiesResourceOwnership;

    public function getAll(): Collection
    {
        $user = $this->getAuthenticatedUser();
        $householdMember = $this->getActiveHouseholdMemberOrNull();

        $query = Goal::query();

        if ($householdMember) {
            $query->where(function ($q) use ($user, $householdMember) {
                $q->where('user_id', $user->id)
                    ->orWhere('household_id', $householdMember->household_id);
            });
        } else {
            $query->where('user_id', $user->id);
        }

        return $query->with('milestones')
            ->orderBy('deadline', 'asc')
            ->orderBy('title', 'asc')
            ->get();
    }

    public function create(array $goalData): Goal
    {
        $goal = Goal::create($goalData);
        return $goal->load('milestones');
    }

    public function update(int $id, array $goalData): Goal
    {
        $goal = $this->findGoalForUser($id);
        $wasCompleted = $goal->completed_at !== null;
        
        $goal->update($goalData);
        $this->updateCompletionStatus($goal, $wasCompleted);

        return $goal->fresh()->load('milestones');
    }

    public function delete(int $id): void
    {
        $goal = $this->findGoalForUser($id);
        $goal->delete();
    }

    public function updateProgress(int $id, float $current): Goal
    {
        $goal = $this->findGoalForUser($id);
        $wasCompleted = $goal->completed_at !== null;
        
        $goal->update([
            'current' => $current,
            'updated_by_user_id' => $this->getAuthenticatedUser()->id,
        ]);
        
        $this->updateCompletionStatus($goal, $wasCompleted);

        return $goal->fresh()->load('milestones');
    }

    public function createMilestone(int $goalId, array $milestoneData): GoalMilestone
    {
        $goal = $this->findGoalForUser($goalId);
        $milestone = GoalMilestone::create($milestoneData);
        
        $this->recalculateGoalCompletion($goal);
        
        return $milestone;
    }

    public function updateMilestone(int $goalId, int $milestoneId, array $milestoneData): GoalMilestone
    {
        $goal = $this->findGoalForUser($goalId);
        $milestone = $this->findMilestoneForGoal($goalId, $milestoneId);
        
        $milestone->update($milestoneData);
        $this->recalculateGoalCompletion($goal);

        return $milestone->fresh();
    }

    public function deleteMilestone(int $goalId, int $milestoneId): void
    {
        $goal = $this->findGoalForUser($goalId);
        $milestone = $this->findMilestoneForGoal($goalId, $milestoneId);
        
        $milestone->delete();
        $this->recalculateGoalCompletion($goal);
    }

    //code used in several functions aboove so make methods and call them
    protected function findGoalForUser(int $id): Goal
    {
        $user = $this->getAuthenticatedUser();
        $householdMember = $this->getActiveHouseholdMemberOrNull();

        $query = Goal::where('id', $id)
            ->where(function ($q) use ($user, $householdMember) {
                $q->where('user_id', $user->id);
                if ($householdMember) {
                    $q->orWhere('household_id', $householdMember->household_id);
                }
            });

        return $query->firstOrFail();
    }

    protected function findMilestoneForGoal(int $goalId, int $milestoneId): GoalMilestone
    {
        return GoalMilestone::where('id', $milestoneId)
            ->where('goal_id', $goalId)
            ->firstOrFail();
    }


    protected function updateCompletionStatus(Goal $goal, bool $wasCompleted): void
    {
        $goal->refresh();
        $goal->load('milestones');
        
        $isFullyCompleted = $this->isGoalFullyCompleted($goal);

        if ($isFullyCompleted && !$wasCompleted) {
            $goal->update(['completed_at' => now()]);
        } elseif (!$isFullyCompleted && $wasCompleted) {
            $goal->update(['completed_at' => null]);
        }
    }

    protected function recalculateGoalCompletion(Goal $goal): void
    {
        $goal->refresh();
        $wasCompleted = $goal->completed_at !== null;
        $this->updateCompletionStatus($goal, $wasCompleted);
    }
    protected function isGoalFullyCompleted(Goal $goal): bool
    {
        $progressPercentage = ($goal->current / $goal->target) * 100;
        $isProgressComplete = $progressPercentage >= 100;
        
        $goal->load('milestones');
        $hasMilestones = $goal->milestones->count() > 0;
        $allMilestonesComplete = !$hasMilestones || $goal->milestones->every(function ($milestone) {
            return $milestone->completed;
        });
        
        return $isProgressComplete && $allMilestonesComplete;
    }
}