<?php

namespace App\Data;

class WeeklyAnalyticsData
{
    public static function empty(): array
    {
        return [
            'steps' => [],
            'sleep' => [],
            'mood' => [],
        ];
    }

    public static function stepsEntry(string $day, int $me, int $partner): array
    {
        return [
            'day' => $day,
            'me' => $me,
            'partner' => $partner,
        ];
    }

    public static function sleepEntry(string $day, ?float $hours): array
    {
        return [
            'day' => $day,
            'hours' => $hours,
        ];
    }

    public static function moodEntry(string $day, ?float $me, ?float $partner): array
    {
        return [
            'day' => $day,
            'me' => $me,
            'partner' => $partner,
        ];
    }
}