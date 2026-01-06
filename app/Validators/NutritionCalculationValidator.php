<?php

namespace App\Validators;

use Illuminate\Support\Facades\Validator;

class NutritionCalculationValidator
{
    // Validates and sanitizes LLM response for nutrition calculation
    // Matches intake entries to correct user/partner IDs and names
    public static function validateAndSanitize(array $data, int $userId, string $userName, ?int $partnerUserId = null, ?string $partnerName = null): array
    {
        $validator = Validator::make($data, [
            'partnersIntake' => 'nullable|array',
            'partnersIntake.*.userId' => 'nullable|string',
            'partnersIntake.*.name' => 'nullable|string',
            'partnersIntake.*.today' => 'nullable|array',
            'partnersIntake.*.today.calories' => 'nullable|numeric|min:0',
            'partnersIntake.*.today.protein' => 'nullable|numeric|min:0',
            'partnersIntake.*.today.carbs' => 'nullable|numeric|min:0',
            'partnersIntake.*.today.fat' => 'nullable|numeric|min:0',
            'partnersIntake.*.weekly' => 'nullable|array',
            'partnersIntake.*.weekly.calories' => 'nullable|numeric|min:0',
            'partnersIntake.*.weekly.protein' => 'nullable|numeric|min:0',
            'partnersIntake.*.weekly.carbs' => 'nullable|numeric|min:0',
            'partnersIntake.*.weekly.fat' => 'nullable|numeric|min:0',
            'recommendations' => 'nullable|array',
            'recommendations.*' => 'string',
            'suggestedMeals' => 'nullable|array',
            'suggestedMeals.*.id' => 'nullable|integer',
            'suggestedMeals.*.name' => 'nullable|string',
            'suggestedMeals.*.calories' => 'nullable|numeric|min:0',
            'suggestedMeals.*.protein' => 'nullable|numeric|min:0',
            'suggestedMeals.*.carbs' => 'nullable|numeric|min:0',
            'suggestedMeals.*.fat' => 'nullable|numeric|min:0',
        ]);

            $validated = $validator->validated();

        // Fix IDs and names by strict ID match; fallback to user
        if (isset($validated['partnersIntake'])) {
            foreach ($validated['partnersIntake'] as $key => $intake) {
                $intakeUserId = isset($intake['userId']) ? (string) $intake['userId'] : '';

                if ($intakeUserId === (string) $userId) {
                    $validated['partnersIntake'][$key]['userId'] = (string) $userId;
                    $validated['partnersIntake'][$key]['name'] = $userName;
                } elseif ($partnerUserId && $intakeUserId === (string) $partnerUserId) {
                    $validated['partnersIntake'][$key]['userId'] = (string) $partnerUserId;
                    $validated['partnersIntake'][$key]['name'] = $partnerName ?? 'Partner';
                } else {
                    // Fallback to user
                    $validated['partnersIntake'][$key]['userId'] = (string) $userId;
                    $validated['partnersIntake'][$key]['name'] = $userName;
                }
            }

            // Remove duplicates (keep first of each userId)
            $seenIds = [];
            $unique = [];
            foreach ($validated['partnersIntake'] as $intake) {
                $id = $intake['userId'] ?? '';
                if ($id !== '' && isset($seenIds[$id])) {
                    continue;
                }
                if ($id !== '') {
                    $seenIds[$id] = true;
                }
                $unique[] = $intake;
            }
            $validated['partnersIntake'] = array_values($unique);
        }

        return [
            'partnersIntake' => $validated['partnersIntake'] ?? [],
            'recommendations' => $validated['recommendations'] ?? [],
            'suggestedMeals' => $validated['suggestedMeals'] ?? [],
        ];
    }
}
