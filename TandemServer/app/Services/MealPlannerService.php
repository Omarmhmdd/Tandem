<?php

namespace App\Services;

use App\Models\MealPlan;
use App\Models\MatchMeal;
use App\Http\Traits\VerifiesResourceOwnership;
use App\Http\Traits\HasDatabaseTransactions;
use Illuminate\Support\Collection;
class MealPlannerService
{
    use VerifiesResourceOwnership, HasDatabaseTransactions;

    public function getWeeklyPlan(?string $weekStart = null): Collection
    {
        $householdMember = $this->getActiveHouseholdMemberOrNull();

        if (!$householdMember) {
            return collect([]);
        }

        if (!$weekStart) {
            $weekStart = now()->startOfWeek()->format('Y-m-d');
        }

        $weekEnd = date('Y-m-d', strtotime($weekStart . ' +6 days'));

        return MealPlan::where('household_id', $householdMember->household_id)
            ->whereBetween('date', [$weekStart, $weekEnd])
            ->with(['recipe', 'matchMeal.invitedBy', 'matchMeal.invitedTo'])
            ->orderBy('date', 'asc')
            ->orderBy('meal_type', 'asc')
            ->get();
    }

    public function create(array $mealPlanData): MealPlan
    {
        // Check if a meal plan exists (including soft-deleted) for this household/date/meal_type
        $existingMealPlan = MealPlan::withTrashed()
            ->where('household_id', $mealPlanData['household_id'])
            ->where('date', $mealPlanData['date'])
            ->where('meal_type', $mealPlanData['meal_type'])
            ->first();
        
        if ($existingMealPlan) {
            // If soft-deleted, restore it first
            if ($existingMealPlan->trashed()) {
                $existingMealPlan->restore();
            }
            // Update the existing meal plan
            $existingMealPlan->update($mealPlanData);
            $mealPlan = $existingMealPlan->fresh();
        } else {
            // Create a new meal plan
            $mealPlan = MealPlan::create($mealPlanData);
        }
        
        return $mealPlan->load(['recipe', 'matchMeal.invitedBy', 'matchMeal.invitedTo']);
    }

    public function update(int $id, array $mealPlanData): MealPlan
    {
        $householdMember = $this->getActiveHouseholdMember();
        $mealPlan = $this->findMealPlanForHousehold($id, $householdMember->household_id);
        
        $mealPlan->update($mealPlanData);

        return $mealPlan->fresh()->load(['recipe', 'matchMeal.invitedBy', 'matchMeal.invitedTo']);
    }

    public function delete(int $id): void
    {
        $householdMember = $this->getActiveHouseholdMember();
        $mealPlan = $this->findMealPlanForHousehold($id, $householdMember->household_id);
        $mealPlan->delete();
    }

     protected function findMealPlanForHousehold(int $id, int $householdId): MealPlan
    {
        return MealPlan::where('id', $id)
            ->where('household_id', $householdId)
            ->firstOrFail();
    }

    protected function findMatchMealForUser(int $matchMealId, int $userId): MatchMeal
    {
        return MatchMeal::where('id', $matchMealId)
            ->where('invited_to_user_id', $userId)
            ->where('status', 'pending')
            ->with('mealPlan')
            ->firstOrFail();
    }


    protected function verifyMatchMealHousehold(MatchMeal $matchMeal, int $householdId): void
    {
        if ($matchMeal->mealPlan->household_id !== $householdId) {
            abort(403, 'You do not have permission to respond to this match meal');
        }
    }

    protected function validateMatchMealStatus(string $status): void
    {
        if (!in_array($status, ['accepted', 'declined'])) {
            abort(400, 'Invalid status. Must be "accepted" or "declined"');
        }
    }

    public function createMatchMeal(array $matchMealData): MatchMeal
    {
        $householdMember = $this->getActiveHouseholdMember();

        return $this->transaction(function () use ($matchMealData, $householdMember) {
            $mealPlan = $this->findMealPlanForHousehold(
                $matchMealData['meal_plan_id'],
                $householdMember->household_id
            );

            $matchMeal = MatchMeal::create($matchMealData);
            $mealPlan->update(['is_match_meal' => true]);

            // Auto-accept the match-meal
            $matchMeal->update(['status' => 'accepted','responded_at' => now(),]);

            $matchMeal->load(['mealPlan.recipe.ingredients','mealPlan.recipe.instructions','invitedBy','invitedTo']);

            return $matchMeal;
        });
    }

    public function respondToMatchMeal(int $matchMealId, string $status): MatchMeal
    {
        $householdMember = $this->getActiveHouseholdMember();
        $user = $this->getAuthenticatedUser();

        $matchMeal = $this->findMatchMealForUser($matchMealId, $user->id);
        $this->verifyMatchMealHousehold($matchMeal, $householdMember->household_id);
        $this->validateMatchMealStatus($status);

        $matchMeal->update([
            'status' => $status,
            'responded_at' => now(),
        ]);

        return $matchMeal->fresh()->load([
            'mealPlan.recipe',
            'invitedBy',
            'invitedTo'
        ]);
    }


   
}