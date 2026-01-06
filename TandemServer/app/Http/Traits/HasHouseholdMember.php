<?php

namespace App\Http\Traits;

use App\Models\HouseholdMember;
use Illuminate\Support\Facades\Auth;
use Exception;

trait HasHouseholdMember
{
    protected function getHouseholdMember(): HouseholdMember
    {
        $user = Auth::user();

        if (!$user) {
            throw new Exception('User not authenticated');
        }

        $householdMember = HouseholdMember::where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (!$householdMember) {
            throw new Exception('User is not a member of any household');
        }

        return $householdMember;
    }

    protected function getHouseholdMemberOrNull(): ?HouseholdMember
    {
        try {
            return $this->getHouseholdMember();
        } catch (Exception $e) {
            return null;
        }
    }
}


