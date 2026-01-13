<?php

namespace App\Data;

use App\Models\HealthLog;
use App\Models\NutritionTarget;
use App\Models\Recipe;

class NutritionData
{
    // Retrieves food entries from health logs for a specific user
    // Gets logs from today, this week, and the last 7 days
    // Filters out logs with no food items
    public static function getFoodLogs(int $userId): array
    {
        $today = now()->format('Y-m-d');
        $weekStart = now()->startOfWeek()->format('Y-m-d');
        $sevenDaysAgo = now()->subDays(7)->format('Y-m-d');

        $logs = HealthLog::where('user_id', $userId)
            ->where(function ($q) use ($today, $weekStart, $sevenDaysAgo) {
                $q->where('date', $today)
                  ->orWhereBetween('date', [$weekStart, $today])
                  ->orWhereBetween('date', [$sevenDaysAgo, $today]);
            })
            ->orderBy('date', 'desc')
            ->get();

        $foodLogs = [];
        foreach ($logs as $log) {
            $food = self::parseFoodFromLog($log);
            if (!empty($food)) {
                $foodLogs[] = [
                    'date' => $log->date->format('Y-m-d'),
                    'food' => $food,
                ];
            }
        }

        return $foodLogs;
    }

    // Gets TODAY's food logs only (for daily intake display)
    public static function getTodayFoodLogs(int $userId): array
    {
        $today = now()->format('Y-m-d');

        $logs = HealthLog::where('user_id', $userId)
            ->where('date', $today)
            ->orderBy('created_at', 'desc')
            ->get();

        $foodLogs = [];
        foreach ($logs as $log) {
            $food = self::parseFoodFromLog($log);
            if (!empty($food)) {
                $foodLogs[] = [
                    'date' => $log->date->format('Y-m-d'),
                    'food' => $food,
                ];
            }
        }

        return $foodLogs;
    }
    
    // Gets the last food log timestamp for today (for cache invalidation)
    // CRITICAL: This must always query fresh data (no caching) to detect new food logs
    public static function getLastFoodLogTimestamp(int $userId): ?string
    {
        $today = now()->format('Y-m-d');
        
        // CRITICAL: Use fresh() to bypass query cache and get latest data
        // This ensures new food logs are detected immediately
        $lastLog = HealthLog::where('user_id', $userId)
            ->where('date', $today)
            ->where(function($query) {
                $query->whereNotNull('food')
                      ->orWhereJsonLength('food', '>', 0);
            })
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc') // Secondary sort to ensure consistency
            ->first(); // No ->fresh() needed, but ensure we're not using cached query
        
        if (!$lastLog) {
            return null;
        }
        
        // Check if food array is not empty
        $food = $lastLog->food ?? [];
        if (is_string($food)) {
            $food = json_decode($food, true) ?? [];
        }
        
        if (empty($food) || !is_array($food) || count($food) === 0) {
            return null;
        }
        
        // Return timestamp with microseconds for better precision
        return $lastLog->created_at?->toIso8601String();
    }

    // Gets last 7 days of food logs (for weekly patterns and recommendations)
    public static function getWeeklyFoodLogs(int $userId): array
    {
        $sevenDaysAgo = now()->subDays(7)->format('Y-m-d');
        $today = now()->format('Y-m-d');

        $logs = HealthLog::where('user_id', $userId)
            ->whereBetween('date', [$sevenDaysAgo, $today])
            ->orderBy('date', 'desc')
            ->get();

        $foodLogs = [];
        foreach ($logs as $log) {
            $food = self::parseFoodFromLog($log);
            if (!empty($food)) {
                $foodLogs[] = [
                    'date' => $log->date->format('Y-m-d'),
                    'food' => $food,
                ];
            }
        }

        return $foodLogs;
    }

    // Parses food array from health log, handles string conversion
    private static function parseFoodFromLog(HealthLog $log): array
    {
        $food = $log->food ?? [];
        
        if (is_string($food)) {
            $food = json_decode($food, true) ?? [];
        }
        
        return is_array($food) ? $food : [];
    }

    // Gets nutrition targets (calories, protein, carbs, fat) for user and partner
    // Returns null for user/partner if no target exists
    public static function getNutritionTargets(int $userId, ?int $partnerUserId = null): array
    {
        $userTarget = NutritionTarget::where('user_id', $userId)->first();
        $partnerTarget = $partnerUserId 
            ? NutritionTarget::where('user_id', $partnerUserId)->first() 
            : null;

        return [
            'user' => $userTarget ? [
                'calories' => $userTarget->calories,
                'protein' => $userTarget->protein,
                'carbs' => $userTarget->carbs,
                'fat' => $userTarget->fat,
            ] : null,
            'partner' => $partnerTarget ? [
                'calories' => $partnerTarget->calories,
                'protein' => $partnerTarget->protein,
                'carbs' => $partnerTarget->carbs,
                'fat' => $partnerTarget->fat,
            ] : null,
        ];
    }

    // Gets available recipes from the household for meal suggestions
    // Returns recipes with ID and name only
    public static function getAvailableRecipes(int $householdId): array
    {
        return Recipe::where('household_id', $householdId)
            ->get()
            ->map(fn($recipe) => [
                'id' => $recipe->id,
                'name' => $recipe->name,
            ])
            ->toArray();
    }

    /**
     * Collects all nutrition-related data needed for LLM calculation
     * 
     * @param int $userId Current user ID
     * @param object|null $partner Partner object (if exists)
     * @param int $householdId Household ID for recipe lookup
     * @return array Structured nutrition data with logs, targets, and recipes
     */
    public static function collectNutritionData(int $userId, ?object $partner, int $householdId): array
    {
        // Get TODAY's logs for daily intake display
        $userTodayLogs = self::getTodayFoodLogs($userId);
        $partnerTodayLogs = $partner && isset($partner->user_id) && $partner->user_id 
            ? self::getTodayFoodLogs($partner->user_id)
            : [];
        
        // Get last 7 days for weekly patterns and recommendations
        $userWeeklyLogs = self::getWeeklyFoodLogs($userId);
        $partnerWeeklyLogs = $partner && isset($partner->user_id) && $partner->user_id 
            ? self::getWeeklyFoodLogs($partner->user_id)
            : [];
        
        return [
            'userTodayLogs' => $userTodayLogs,
            'partnerTodayLogs' => $partnerTodayLogs,
            'userWeeklyLogs' => $userWeeklyLogs,
            'partnerWeeklyLogs' => $partnerWeeklyLogs,
            'targets' => self::getNutritionTargets($userId, $partner?->user_id ?? null),
            'availableRecipes' => self::getAvailableRecipes($householdId),
        ];
    }
}