<?php

namespace App\Data;

class NutritionResponseData
{

    public static function build(array $validated, array $targets): array
    {
        return [
            'partnersIntake' => $validated['partnersIntake'] ?? [],
            'recommendations' => $validated['recommendations'] ?? [],
            'suggestedMeals' => $validated['suggestedMeals'] ?? [],
            'targets' => $targets,
        ];
    }


    public static function generateCacheKey(int $userId, ?int $partnerUserId, ?string $userLastTimestamp, ?string $partnerLastTimestamp): string
    {
        $today = now()->format('Y-m-d');
        $timestampHash = md5(($userLastTimestamp ?? 'none') . '_' . ($partnerLastTimestamp ?? 'none'));
        
        $cacheKey = "nutrition_recommendations_{$userId}_{$today}_{$timestampHash}";
        
        if ($partnerUserId) {
            $cacheKey .= "_{$partnerUserId}";
        }
        
        return $cacheKey;
    }

    
    public static function getCacheExpiration(): \Carbon\Carbon
    {
        return now()->endOfDay();
    }
}

