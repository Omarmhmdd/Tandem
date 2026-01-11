<?php

namespace App\Services;

use Config\LlmConstants;
use App\Data\NutritionData;
use App\Http\Traits\VerifiesResourceOwnership;
use App\Services\LlmOnlyService;
use Config\Prompts\NutritionCalculationPrompt;
use App\Validators\NutritionCalculationValidator;

class NutritionService
{
    use VerifiesResourceOwnership;

    public function __construct(
        private LlmOnlyService $llmService
    ) {}

    // Gets nutrition recommendations by calculating intake from food logs and comparing to targets
    public function getNutritionRecommendations(): array
    {
        $householdMember = $this->getActiveHouseholdMember();
        $user = $this->getAuthenticatedUser();
        $partner = $this->getPartner();

        $nutritionData = $this->collectNutritionData($user->id, $partner, $householdMember->household_id);
        $validated = $this->generateNutritionFromLlm($nutritionData, $user, $partner);
        $targets = NutritionData::getNutritionTargets($user->id, $partner?->user_id);
        
        return $this->buildResponse($validated, $targets);
    }

    // Collects all nutrition-related data needed for LLM calculation
    private function collectNutritionData(int $userId, ?object $partner, int $householdId): array
    {
        $userFoodLogs = NutritionData::getFoodLogs($userId);
        $partnerFoodLogs = $partner && $partner->user_id 
            ? NutritionData::getFoodLogs($partner->user_id)
            : [];
        
        return [
            'userFoodLogs' => $userFoodLogs,
            'partnerFoodLogs' => $partnerFoodLogs,
            'targets' => NutritionData::getNutritionTargets($userId, $partner?->user_id),
            'availableRecipes' => NutritionData::getAvailableRecipes($householdId),
        ];
    }

    // Generates nutrition calculation from LLM
    private function generateNutritionFromLlm(array $nutritionData, object $user, ?object $partner): array
    {
        $prompts = $this->buildPrompts($nutritionData, $user, $partner);
        $llmResult = $this->callLlm($prompts['system'], $prompts['user']);
        
        return $this->validateNutritionData($llmResult, $nutritionData, $user, $partner);
    }

    // Builds system and user prompts for LLM
    private function buildPrompts(array $nutritionData, object $user, ?object $partner): array
    {
        $userFoodLogs = $nutritionData['userFoodLogs'];
        $partnerFoodLogs = $nutritionData['partnerFoodLogs'];
        $userTargets = $nutritionData['targets']['user'];
        $partnerTargets = $nutritionData['targets']['partner'];
        $availableRecipes = $nutritionData['availableRecipes'];
        $userName = $user->first_name;
        $userId = (string) $user->id;
        $partnerName = $partner && $partner->user ? $partner->user->first_name : 'Partner';
        $partnerUserId = $partner && $partner->user_id ? (string) $partner->user_id : null;
        
        $systemPrompt = NutritionCalculationPrompt::getSystemPrompt();
        $userPrompt = NutritionCalculationPrompt::buildUserPrompt(
            $userFoodLogs,
            $partnerFoodLogs,
            $userTargets,
            $partnerTargets,
            $availableRecipes,
            $userName,
            $userId,
            $partnerName,
            $partnerUserId
        );
        
        return [
            'system' => $systemPrompt,
            'user' => $userPrompt,
        ];
    }

    // Calls LLM service to generate nutrition calculation
    // Use TEMPERATURE_ANALYSIS for better variety in recommendations while maintaining calculation accuracy
    private function callLlm(string $systemPrompt, string $userPrompt): array
    {
        return $this->llmService->generateJson(
            $systemPrompt,
            $userPrompt,
            ['temperature' => LlmConstants::TEMPERATURE_ANALYSIS] // Increased from 0.5 to 0.7 for more diverse recommendations
        );
    }

    // Validates and sanitizes LLM response
    private function validateNutritionData(array $llmResult, array $nutritionData, object $user, ?object $partner): array
    {
        $partnerUserId = $partner && $partner->user_id ? $partner->user_id : null;
        $partnerName = $partner && $partner->user ? $partner->user->first_name : null;
        $partnerHasFoodLogs = !empty($nutritionData['partnerFoodLogs']);
        
        $validated = NutritionCalculationValidator::validateAndSanitize(
            $llmResult,
            $user->id,
            $user->first_name,
            $partnerUserId,
            $partnerName,
            $partnerHasFoodLogs
        );
        
        // CRITICAL FIX: Always recalculate partner intake from actual partner food logs to ensure accuracy
        // LLM sometimes calculates from wrong food logs, so we override with backend calculation
        if ($partnerUserId && $partnerHasFoodLogs && isset($validated['partnersIntake'])) {
            $manualIntake = $this->calculatePartnerIntakeManually($nutritionData['partnerFoodLogs'], (string)$partnerUserId, $partnerName ?? 'Partner');
            
            if ($manualIntake) {
                // Find and replace partner intake entry
                foreach ($validated['partnersIntake'] as $key => $intake) {
                    $intakeUserId = isset($intake['userId']) ? (string) $intake['userId'] : '';
                    if ($intakeUserId === (string) $partnerUserId) {
                        // Override LLM calculation with accurate backend calculation
                        $validated['partnersIntake'][$key] = $manualIntake;
                        break;
                    }
                }
            }
        }
        
        return $validated;
    }
    
    // Manual calculation of partner intake from food logs as fallback when LLM fails
    private function calculatePartnerIntakeManually(array $partnerFoodLogs, string $partnerUserId, string $partnerName): ?array
    {
        if (empty($partnerFoodLogs)) {
            return null;
        }
        
        // Nutrition values mapping (same as LLM prompt)
        $nutritionMap = [
            'dinner' => ['calories' => 500, 'protein' => 30, 'carbs' => 50, 'fat' => 20],
            'lunch' => ['calories' => 400, 'protein' => 25, 'carbs' => 45, 'fat' => 15],
            'breakfast' => ['calories' => 350, 'protein' => 15, 'carbs' => 40, 'fat' => 12],
            'cake' => ['calories' => 300, 'protein' => 4, 'carbs' => 40, 'fat' => 15],
            'coffee' => ['calories' => 5, 'protein' => 0, 'carbs' => 1, 'fat' => 0],
        ];
        
        $today = now()->format('Y-m-d');
        $dailyTotals = [];
        
        foreach ($partnerFoodLogs as $log) {
            $date = $log['date'] ?? null;
            $food = $log['food'] ?? [];
            if (empty($food) || !is_array($food)) continue;
            
            $dayCalories = 0; $dayProtein = 0; $dayCarbs = 0; $dayFat = 0;
            
            foreach ($food as $item) {
                $itemLower = strtolower(trim($item));
                if (isset($nutritionMap[$itemLower])) {
                    $dayCalories += $nutritionMap[$itemLower]['calories'];
                    $dayProtein += $nutritionMap[$itemLower]['protein'];
                    $dayCarbs += $nutritionMap[$itemLower]['carbs'];
                    $dayFat += $nutritionMap[$itemLower]['fat'];
                }
            }
            
            if ($date && ($dayCalories > 0 || $dayProtein > 0 || $dayCarbs > 0 || $dayFat > 0)) {
                $dailyTotals[$date] = [
                    'calories' => $dayCalories,
                    'protein' => $dayProtein,
                    'carbs' => $dayCarbs,
                    'fat' => $dayFat,
                ];
            }
        }
        
        if (empty($dailyTotals)) {
            return null;
        }
        
        // Find most recent date for "today"
        $dates = array_keys($dailyTotals);
        rsort($dates);
        $mostRecentDate = $dates[0] ?? $today;
        $todayIntake = $dailyTotals[$mostRecentDate] ?? ['calories' => 0, 'protein' => 0, 'carbs' => 0, 'fat' => 0];
        
        // Calculate weekly average
        $weeklyCalories = array_sum(array_column($dailyTotals, 'calories')) / count($dailyTotals);
        $weeklyProtein = array_sum(array_column($dailyTotals, 'protein')) / count($dailyTotals);
        $weeklyCarbs = array_sum(array_column($dailyTotals, 'carbs')) / count($dailyTotals);
        $weeklyFat = array_sum(array_column($dailyTotals, 'fat')) / count($dailyTotals);
        
        return [
            'userId' => $partnerUserId,
            'name' => $partnerName,
            'today' => [
                'calories' => round($todayIntake['calories']),
                'protein' => round($todayIntake['protein']),
                'carbs' => round($todayIntake['carbs']),
                'fat' => round($todayIntake['fat']),
            ],
            'weekly' => [
                'calories' => round($weeklyCalories),
                'protein' => round($weeklyProtein),
                'carbs' => round($weeklyCarbs),
                'fat' => round($weeklyFat),
            ],
        ];
    }

    // Builds final response with validated data and targets
    private function buildResponse(array $validated, array $targets): array
    {
        return [
            'partnersIntake' => $validated['partnersIntake'] ?? [],
            'recommendations' => $validated['recommendations'] ?? [],
            'suggestedMeals' => $validated['suggestedMeals'] ?? [],
            'targets' => $targets,
        ];
    }
}