<?php

namespace App\Data;

class NutritionPromptData
{
    
    public static function extractForPrompts(array $nutritionData, object $user, ?object $partner): array
    {
        return [
            'userTodayLogs' => $nutritionData['userTodayLogs'] ?? [],
            'partnerTodayLogs' => $nutritionData['partnerTodayLogs'] ?? [],
            'userWeeklyLogs' => $nutritionData['userWeeklyLogs'] ?? [],
            'partnerWeeklyLogs' => $nutritionData['partnerWeeklyLogs'] ?? [],
            'userTargets' => $nutritionData['targets']['user'] ?? null,
            'partnerTargets' => $nutritionData['targets']['partner'] ?? null,
            'availableRecipes' => $nutritionData['availableRecipes'] ?? [],
            'userName' => $user->first_name ?? 'User',
            'userId' => (string) ($user->id ?? ''),
            'partnerName' => $partner && isset($partner->user) && $partner->user 
                ? $partner->user->first_name 
                : 'Partner',
            'partnerUserId' => $partner && isset($partner->user_id) && $partner->user_id 
                ? (string) $partner->user_id 
                : null,
        ];
    }

    
    public static function extractPartnerInfo(?object $partner, array $nutritionData): array
    {
        return [
            'partnerUserId' => $partner && isset($partner->user_id) && $partner->user_id 
                ? $partner->user_id 
                : null,
            'partnerName' => $partner && isset($partner->user) && $partner->user 
                ? $partner->user->first_name 
                : null,
            'partnerHasFoodLogs' => !empty($nutritionData['partnerTodayLogs']) 
                || !empty($nutritionData['partnerWeeklyLogs']),
        ];
    }

    
    public static function prepareForSeedGeneration(array $nutritionData): array
    {
        $userTodaySorted = $nutritionData['userTodayLogs'] ?? [];
        $partnerTodaySorted = $nutritionData['partnerTodayLogs'] ?? [];
        $userWeeklySorted = $nutritionData['userWeeklyLogs'] ?? [];
        $partnerWeeklySorted = $nutritionData['partnerWeeklyLogs'] ?? [];
        
        // Sort each log's food array for consistency
        foreach ($userTodaySorted as &$log) {
            if (isset($log['food']) && is_array($log['food'])) {
                sort($log['food']);
            }
        }
        foreach ($partnerTodaySorted as &$log) {
            if (isset($log['food']) && is_array($log['food'])) {
                sort($log['food']);
            }
        }
        foreach ($userWeeklySorted as &$log) {
            if (isset($log['food']) && is_array($log['food'])) {
                sort($log['food']);
            }
        }
        foreach ($partnerWeeklySorted as &$log) {
            if (isset($log['food']) && is_array($log['food'])) {
                sort($log['food']);
            }
        }
        
        return [
            'userToday' => $userTodaySorted,
            'partnerToday' => $partnerTodaySorted,
            'userWeekly' => $userWeeklySorted,
            'partnerWeekly' => $partnerWeeklySorted,
        ];
    }


    public static function generateSeed(array $sortedLogs): int
    {
        $foodLogsHash = md5(json_encode($sortedLogs, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        return crc32($foodLogsHash);
    }
}

