<?php

namespace App\Data;

class PantryWasteData
{
    public static function empty(): array
    {
        return [
            'used' => 0,
            'wasted' => 0,
            'donated' => 0,
        ];
    }

    public static function calculate(int $totalExpired): array
    {
        $wasted = (int) ($totalExpired * \App\Constants\AnalyticsConstants::PANTRY_WASTE_PERCENTAGE);
        $donated = (int) ($totalExpired * \App\Constants\AnalyticsConstants::PANTRY_DONATED_PERCENTAGE);
        $used = $totalExpired - $wasted - $donated;

        return [
            'used' => $used,
            'wasted' => $wasted,
            'donated' => $donated,
        ];
    }
}