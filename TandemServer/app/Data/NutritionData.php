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
}