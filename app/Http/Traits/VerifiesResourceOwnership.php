<?php

namespace App\Http\Traits;

use App\Models\HouseholdMember;
use App\Http\Traits\HasAuthenticatedUser;
use Illuminate\Auth\Access\AuthorizationException;
use App\Models\Recipe;
use App\Models\PantryItem;
use App\Models\MealPlan;
trait VerifiesResourceOwnership
{
    use HasAuthenticatedUser;

    protected ?HouseholdMember $activeHouseholdMember = null;

    protected function getActiveHouseholdMemberOrNull(): ?HouseholdMember
    {
        try {
            return $this->getActiveHouseholdMember();
        } catch (AuthorizationException $e) {
            return null;
        }
    }

    protected function getPartner(): ?HouseholdMember
    {
        $householdMember = $this->getActiveHouseholdMember();
        $user = $this->getAuthenticatedUser();

        return HouseholdMember::where('household_id', $householdMember->household_id)
            ->where('user_id', '!=', $user->id)
            ->where('status', 'active')
            ->with('user')
            ->first();
    }

    protected function getHouseholdId(): int
    {
        return $this->getActiveHouseholdMember()->household_id;
    }

    protected function verifyHouseholdAccess(int $householdId): void
    {
        $householdMember = $this->getActiveHouseholdMember();

        if ($householdMember->household_id !== $householdId) {
            throw new AuthorizationException('You do not have access to this household');
        }
    }

    protected function isPrimaryMember(?int $householdId = null): bool
    {
        $householdMember = $this->getActiveHouseholdMember();

        if ($householdId && $householdMember->household_id !== $householdId) {
            return false;
        }

        return $householdMember->role === 'primary';
    }

    protected function getActiveHouseholdMember(): HouseholdMember
    {
        if ($this->activeHouseholdMember === null) {
            $user = $this->getAuthenticatedUser();

            $members = HouseholdMember::where('user_id', $user->id)
                ->where('status', 'active')
                ->with('household')
                ->get();

            if ($members->isEmpty()) {
                throw new AuthorizationException('User is not a member of any household');
            }
            $this->activeHouseholdMember = $members->first(function($member) {
                if ($member->role !== 'primary') {
                    return false;
                }
                $householdId = $member->household_id;
                return Recipe::where('household_id', $householdId)->exists()
                    || PantryItem::where('household_id', $householdId)->exists()
                    || MealPlan::where('household_id', $householdId)->exists();
            });
            if (!$this->activeHouseholdMember) {
                $this->activeHouseholdMember = $members->first(function($member) {
                    $householdId = $member->household_id;
                    return Recipe::where('household_id', $householdId)->exists()
                        || PantryItem::where('household_id', $householdId)->exists()
                        || MealPlan::where('household_id', $householdId)->exists();
                });
            }
            if (!$this->activeHouseholdMember) {
                $this->activeHouseholdMember = $members->first(function($member) {
                    return $member->role === 'primary';
                });
            }
            if (!$this->activeHouseholdMember) {
                $this->activeHouseholdMember = $members->first();
            }
        }

        return $this->activeHouseholdMember;
    }

}
