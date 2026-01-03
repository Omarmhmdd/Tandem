<?php

namespace App\Data;

use Illuminate\Support\Carbon;

class ShoppingListData
{
    public static function prepare(
        $householdMember,
        $mealPlan,
        $user
    ): array {
        $weekStart = Carbon::parse($mealPlan->date)->startOfWeek()->format('Y-m-d');

        return [
            'household_id' => $householdMember->household_id,
            'for_week_start' => $weekStart,
            'generated_at' => now(),
            'created_by_user_id' => $user->id,
            'updated_by_user_id' => $user->id,
        ];
    }
}