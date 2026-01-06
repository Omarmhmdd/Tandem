<?php

namespace App\Http\Traits;

use App\Models\Household;
use App\Models\User;

trait PreparesHouseholdMemberData
{
    protected function prepareInviteMemberData(Household $household, string $code): array
    {
        return [
            'household_id' => $household->id,
            'role' => 'partner',
            'invite_token' => $code,
            'status' => 'pending',
        ];
    }

    protected function prepareJoinMemberData(User $user): array
    {
        return [
            'user_id' => $user->id,
            'status' => 'active',
            'joined_at' => now(),
        ];
    }
}

