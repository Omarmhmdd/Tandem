<?php

namespace App\Data;

class MoodEntryData
{
    public static function getSearchCriteria(array $healthLogData): array
    {
        return [
            'user_id' => $healthLogData['user_id'],
            'date' => $healthLogData['date'],
        ];
    }

    public static function getUpdateData(array $healthLogData): array
    {
        return [
            'mood' => $healthLogData['mood'],
            'time' => $healthLogData['time'] ?? now()->format('H:i:s'),
            'notes' => $healthLogData['notes'] ?? null,
        ];
    }
}