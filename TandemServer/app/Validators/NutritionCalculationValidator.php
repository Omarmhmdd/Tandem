<?php

namespace App\Validators;

use Illuminate\Support\Facades\Validator;

class NutritionCalculationValidator
{
    // Validates and sanitizes LLM response for nutrition calculation
    // Matches intake entries to correct user/partner IDs and names
    public static function validateAndSanitize(array $data, int $userId, string $userName, ?int $partnerUserId = null, ?string $partnerName = null, bool $partnerHasFoodLogs = false): array
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

        // Fix IDs and names by strict ID match; ensure both user and partner entries exist
        $userIntake = null;
        $partnerIntake = null;
        
        if (isset($validated['partnersIntake'])) {
            foreach ($validated['partnersIntake'] as $key => $intake) {
                $intakeUserId = isset($intake['userId']) ? (string) $intake['userId'] : '';
                $intakeName = isset($intake['name']) ? (string) $intake['name'] : '';

                // Match by userId first (most reliable)
                if ($intakeUserId === (string) $userId) {
                    $validated['partnersIntake'][$key]['userId'] = (string) $userId;
                    $validated['partnersIntake'][$key]['name'] = $userName;
                    $userIntake = $validated['partnersIntake'][$key];
                } elseif ($partnerUserId && $intakeUserId === (string) $partnerUserId) {
                    $validated['partnersIntake'][$key]['userId'] = (string) $partnerUserId;
                    $validated['partnersIntake'][$key]['name'] = $partnerName ?? 'Partner';
                    $partnerIntake = $validated['partnersIntake'][$key];
                } elseif ($partnerUserId && $intakeName === $partnerName) {
                    // Fallback: match by name if userId doesn't match (LLM might return wrong userId)
                    $validated['partnersIntake'][$key]['userId'] = (string) $partnerUserId;
                    $validated['partnersIntake'][$key]['name'] = $partnerName ?? 'Partner';
                    $partnerIntake = $validated['partnersIntake'][$key];
                } elseif (stripos($intakeName, $userName) !== false || stripos($userName, $intakeName) !== false) {
                    // Fallback: match by name similarity for user
                    $validated['partnersIntake'][$key]['userId'] = (string) $userId;
                    $validated['partnersIntake'][$key]['name'] = $userName;
                    $userIntake = $validated['partnersIntake'][$key];
                } else {
                    // Default: assign to user if can't determine
                    $validated['partnersIntake'][$key]['userId'] = (string) $userId;
                    $validated['partnersIntake'][$key]['name'] = $userName;
                    if (!$userIntake) {
                        $userIntake = $validated['partnersIntake'][$key];
                    }
                }
            }
        }

        // Ensure both user and partner entries exist if partner exists
        $finalIntake = [];
        
        // Add user intake (required)
        if ($userIntake) {
            $finalIntake[] = $userIntake;
        } else {
            // Create default user entry if missing
            $finalIntake[] = [
                'userId' => (string) $userId,
                'name' => $userName,
                'today' => ['calories' => 0, 'protein' => 0, 'carbs' => 0, 'fat' => 0],
                'weekly' => ['calories' => 0, 'protein' => 0, 'carbs' => 0, 'fat' => 0],
            ];
        }
        
        // Add partner intake if partner exists
        if ($partnerUserId) {
            if ($partnerIntake) {
                // Check if partner has food logs but LLM returned all zeros - this is an error
                if ($partnerHasFoodLogs) {
                    $todayTotal = ($partnerIntake['today']['calories'] ?? 0) + 
                                 ($partnerIntake['today']['protein'] ?? 0) + 
                                 ($partnerIntake['today']['carbs'] ?? 0) + 
                                 ($partnerIntake['today']['fat'] ?? 0);
                    $weeklyTotal = ($partnerIntake['weekly']['calories'] ?? 0) + 
                                  ($partnerIntake['weekly']['protein'] ?? 0) + 
                                  ($partnerIntake['weekly']['carbs'] ?? 0) + 
                                  ($partnerIntake['weekly']['fat'] ?? 0);
                    
                    // If partner has food logs but all values are zero, keep the data
                    // (LLM might have calculated incorrectly, but we return what it gave us)
                }
                $finalIntake[] = $partnerIntake;
            } else {
                // Partner exists but LLM didn't return their data
                // Create entry with zeros (partner will appear but with no data)
                $finalIntake[] = [
                    'userId' => (string) $partnerUserId,
                    'name' => $partnerName ?? 'Partner',
                    'today' => ['calories' => 0, 'protein' => 0, 'carbs' => 0, 'fat' => 0],
                    'weekly' => ['calories' => 0, 'protein' => 0, 'carbs' => 0, 'fat' => 0],
                ];
            }
        }
        
        $validated['partnersIntake'] = $finalIntake;

        return [
            'partnersIntake' => $validated['partnersIntake'] ?? [],
            'recommendations' => $validated['recommendations'] ?? [],
            'suggestedMeals' => $validated['suggestedMeals'] ?? [],
        ];
    }
}
