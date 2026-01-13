<?php

namespace App\Data;
use App\Constants\AnalyticsConstants;
class PantryWasteData
{
    public static function empty(): array
    {
        return [
            'active' => 0,
            'expiring_soon' => 0,
            'deleted' => 0,
        ];
    }


    public static function calculateFromCounts(int $activeCount, int $expiringSoonCount, int $deletedCount): array
    {
        return [
            'active' => $activeCount,
            'expiring_soon' => $expiringSoonCount,
            'deleted' => $deletedCount,
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