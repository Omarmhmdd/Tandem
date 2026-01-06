<?php

namespace App\Http\Traits;

use App\Models\Goal;
use App\Models\Expense;

trait UpdatesWeddingGoals
{

    protected function updateWeddingGoalIfNeeded(Expense $expense, string $operation): void
    {
        if ($expense->category === 'wedding') {
            $this->updateWeddingGoal($expense->household_id, (float) $expense->amount, $operation, $expense->user_id);
        }
    }

    protected function handleWeddingGoalUpdate(Expense $expense, bool $wasWedding, float $oldAmount): void
    {
        $isWedding = $expense->category === 'wedding';
        $newAmount = (float) $expense->amount;

        if (!$wasWedding && $isWedding) {
            $this->updateWeddingGoal($expense->household_id, $newAmount, 'add', $expense->user_id);
            return;
        }

        if ($wasWedding && !$isWedding) {
            $this->updateWeddingGoal($expense->household_id, $oldAmount, 'subtract', $expense->user_id);
            return;
        }

        if ($wasWedding && $isWedding && $oldAmount != $newAmount) {
            $this->adjustWeddingGoal($expense->household_id, $oldAmount, $newAmount, $expense->user_id);
        }
    }


    protected function adjustWeddingGoal(int $householdId, float $oldAmount, float $newAmount, ?int $userId): void
    {
        $difference = $newAmount - $oldAmount;
        
        if ($difference > 0) {
            $this->updateWeddingGoal($householdId, $difference, 'add', $userId);
        } else {
            $this->updateWeddingGoal($householdId, abs($difference), 'subtract', $userId);
        }
    }


  protected function updateWeddingGoal(int $householdId, float $amount, string $operation, ?int $userId = null): void
{
    $goal = $this->findWeddingGoal($householdId);
    if (!$goal) {
        return;
    }

    $currentAmount = (float) $goal->current;
    $targetAmount = (float) $goal->target;
    
    if ($operation === 'add') {
        // Cap at target - wedding expenses cannot exceed budget
        $newCurrent = min($currentAmount + $amount, $targetAmount);
    } else {
        $newCurrent = max(0, $currentAmount - $amount);
    }

    $goal->update([
        'current' => $newCurrent,
        'updated_by_user_id' => $userId,
    ]);
}


    protected function findWeddingGoal(int $householdId): ?Goal
    {
        return $this->findHouseholdWeddingGoal($householdId) 
            ?? $this->findUserWeddingGoal($householdId);
    }


    protected function findHouseholdWeddingGoal(int $householdId): ?Goal
    {
        return Goal::where('household_id', $householdId)
            ->where('category', 'wedding')
            ->first();
    }


    protected function findUserWeddingGoal(int $householdId): ?Goal
    {
        return Goal::whereHas('user.householdMembers', function ($q) use ($householdId) {
            $q->where('household_id', $householdId)
                ->where('status', 'active');
        })
        ->where('category', 'wedding')
        ->whereNull('household_id')
        ->first();
    }
}