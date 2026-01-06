<?php

namespace App\Validators;

use Illuminate\Support\Facades\Validator;

class DateNightSuggestionValidator
{
    public static function validateAndSanitize(array $data): array
    {
        $validator = Validator::make($data, [
            'meal' => 'nullable|array',
            'meal.name' => 'nullable|string|max:255',
            'meal.description' => 'nullable|string',
            'meal.cost' => 'nullable|numeric|min:0',
            'meal.recipeId' => 'nullable|integer',
            'meal.usesPantry' => 'nullable|boolean',
            'activity' => 'nullable|array',
            'activity.name' => 'nullable|string|max:255',
            'activity.description' => 'nullable|string',
            'activity.cost' => 'nullable|numeric|min:0',
            'activity.duration' => 'nullable|string',
            'activity.location' => 'nullable|string|in:home,outdoor,venue',
            'treat' => 'nullable|array',
            'treat.name' => 'nullable|string|max:255',
            'treat.description' => 'nullable|string',
            'treat.cost' => 'nullable|numeric|min:0',
            'total_cost' => 'nullable|numeric|min:0',
            'reasoning' => 'nullable|string',
        ]);

        $validated = $validator->validated();

        return [
            'meal' => $validated['meal'] ?? null,
            'activity' => $validated['activity'] ?? null,
            'treat' => $validated['treat'] ?? null,
            'total_cost' => $validated['total_cost'] ?? null,
            'reasoning' => $validated['reasoning'] ?? null,
        ];
    }
}