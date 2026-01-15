<?php

namespace App\Data;

use App\Models\MoodEntry;
use App\Models\PantryItem;
use App\Models\Recipe;
use App\Models\DateNightSuggestion;
use App\Models\DateNightSuggestion as DateNightSuggestionModel;
use App\Models\MealPlan;
class DateNightData
{
    public static function getRecentMoodData(int $householdId): array
    {
        return MoodEntry::whereIn('user_id', function ($q) use ($householdId) {
            $q->select('user_id')
              ->from('household_members')
              ->where('household_id', $householdId)
              ->where('status', 'active');
        })
        ->where('date', '>=', now()->subDays(7))
        ->orderBy('date', 'desc')
        ->get()
        ->map(fn($entry) => [
            'date' => $entry->date->format('Y-m-d'),
            'mood' => $entry->mood,
            'notes' => $entry->notes,
        ])
        ->toArray();
    }

    public static function getPantryItems(int $householdId): array
    {
        return PantryItem::where('household_id', $householdId)
            ->where('quantity', '>', 0)
            ->get()
            ->map(fn($item) => [
                'name' => $item->name,
                'quantity' => $item->quantity,
                'unit' => $item->unit,
            ])
            ->toArray();
    }

    public static function getAvailableRecipes(int $householdId): array
    {
        return Recipe::where('household_id', $householdId)
            ->get()
            ->map(fn($recipe) => [
                'id' => $recipe->id,
                'name' => $recipe->name,
                'description' => $recipe->description,
            ])
            ->toArray();
    }

    public static function getRecentSuggestions(int $householdId): array
    {
        return DateNightSuggestion::where('household_id', $householdId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(fn($suggestion) => [
                'meal' => $suggestion->meal['name'] ?? null,
                'activity' => $suggestion->activity['name'] ?? null,
                'treat' => $suggestion->treat['name'] ?? null,
            ])
            ->filter(fn($s) => $s['meal'] || $s['activity'] || $s['treat'])
            ->toArray();
    }

    public static function buildExpenseDescription(DateNightSuggestionModel $suggestion): string
    {
        return sprintf(
            'Date Night: %s + %s + %s',
            $suggestion->meal['name'] ?? 'Meal',
            $suggestion->activity['name'] ?? 'Activity',
            $suggestion->treat['name'] ?? 'Treat'
        );
    }

    public static function buildSuggestionData(int $householdId, string $suggestedAt, array $validated): array
    {
        return [
            'household_id' => $householdId,
            'suggested_at' => $suggestedAt,
            'meal' => $validated['meal'],
            'activity' => $validated['activity'],
            'treat' => $validated['treat'],
            'total_cost' => $validated['total_cost'],
            'reasoning' => $validated['reasoning'],
            'status' => DateNightSuggestionModel::STATUS_PENDING,
        ];
    }

    public static function buildMealPlanData(DateNightSuggestionModel $suggestion, int $householdId, int $userId, ?int $recipeId = null, string $date = null): array
    {
        return [
            'household_id' => $householdId,
            'date' => $date ?? $suggestion->suggested_at,
            'meal_type' => 'dinner',
            'name' => $suggestion->meal['name'] ?? 'Date Night Meal',
            'recipe_id' => $recipeId,
            'is_match_meal' => false,
            'created_by_user_id' => $userId,
            'updated_by_user_id' => $userId,
        ];
    }

    public static function buildExpenseData(DateNightSuggestionModel $suggestion, int $householdId, int $userId): array
    {
        return [
            'household_id' => $householdId,
            'user_id' => $userId,
            'date' => now()->format('Y-m-d'),
            'amount' => $suggestion->total_cost,
            'description' => self::buildExpenseDescription($suggestion),
            'category' => 'dining',
            'auto_tagged' => false,
            'created_by_user_id' => $userId,
            'updated_by_user_id' => $userId,
        ];
    }
    public static function createOrUpdateMealPlan(DateNightSuggestionModel $suggestion, int $householdId, int $userId, ?int $recipeId = null, string $date = null): void
{
    $mealPlanData = self::buildMealPlanData($suggestion, $householdId, $userId, $recipeId, $date);
    
    MealPlan::updateOrCreate(
        [
            'household_id' => $mealPlanData['household_id'],
            'date' => $mealPlanData['date'],
            'meal_type' => $mealPlanData['meal_type'],
        ],
        $mealPlanData
    );
}
}