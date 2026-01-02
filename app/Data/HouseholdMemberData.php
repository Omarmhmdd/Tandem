<?php

namespace App\Data;

use App\Models\User;
use App\Models\Household;

class HouseholdMemberData
{
    public static function forPrimary(User $user, Household $household): array
    {
        return [
            'household_id' => $household->id,
            'user_id' => $user->id,
            'role' => 'primary',
            'status' => 'active',
            'joined_at' => now(),
        ];
    }
    public static function forPartner(User $user, Household $household): array
{
    return [
        'household_id' => $household->id,
        'user_id' => $user->id,
        'role' => 'partner',
        'status' => 'active',
        'joined_at' => now(),
    ];
}
}

