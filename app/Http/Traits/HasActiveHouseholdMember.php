<?php

namespace App\Http\Traits;

use App\Models\HouseholdMember;

trait HasActiveHouseholdMember
{
    protected function getActiveHouseholdMember()
    {
        if (!$this->user) {
            return null;
        }

        return HouseholdMember::where('user_id', $this->user->id)
            ->where('status', 'active')
            ->first();
    }
}