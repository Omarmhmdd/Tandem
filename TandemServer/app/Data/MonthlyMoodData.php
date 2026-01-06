<?php

namespace App\Data;

class MonthlyMoodData
{
    public static function entry(string $month, ?float $me, ?float $partner): array
    {
        return [
            'month' => $month,
            'me' => $me,
            'partner' => $partner,
        ];
    }
}