<?php

namespace App\Data;

use App\Models\NutritionTarget;

class NutritionTargetData
{
    public static function toArray(?NutritionTarget $target): ?array
    {
        if (!$target) {
            return null;
        }

        return [
            'calories' => $target->calories,
            'protein' => $target->protein,
            'carbs' => $target->carbs,
            'fat' => $target->fat,
        ];
    }
}