<?php

namespace App\Data;
use App\Constants\AnalyticsConstants;
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
        $wasted = (int) ($totalExpired * AnalyticsConstants::PANTRY_WASTE_PERCENTAGE);
        $donated = (int) ($totalExpired * AnalyticsConstants::PANTRY_DONATED_PERCENTAGE);
        $used = $totalExpired - $wasted - $donated;

        return [
            'used' => $used,
            'wasted' => $wasted,
            'donated' => $donated,
        ];
    }
}