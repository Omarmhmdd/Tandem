<?php

namespace App\Services;

use App\Data\NutritionData;
use App\Data\NutritionPromptData;
use App\Data\NutritionResponseData;
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


    public function getNutritionRecommendations(): array
    {
        $householdMember = $this->getActiveHouseholdMember();
        $user = $this->getAuthenticatedUser();
        $partner = $this->getPartner();

        // Get last food log timestamps FIRST to create cache key (faster than collecting all data)
        // CRITICAL: Use fresh query to ensure we get the latest timestamp (no query caching)
        $userLastTimestamp = NutritionData::getLastFoodLogTimestamp($user->id);
        $partnerLastTimestamp = $partner?->user_id 
            ? NutritionData::getLastFoodLogTimestamp($partner->user_id) 
            : null;
        
        // Generate cache key and check cache FIRST before collecting data (much faster)
        $cacheKey = NutritionResponseData::generateCacheKey(
            $user->id,
            $partner?->user_id,
            $userLastTimestamp,
            $partnerLastTimestamp
        );
        
        $cached = cache()->get($cacheKey);
        if ($cached !== null) {
            return $cached;
        }
        
        // Only collect data if cache miss
        $nutritionData = NutritionData::collectNutritionData($user->id, $partner, $householdMember->household_id);
        $validated = $this->generateNutritionFromLlm($nutritionData, $user, $partner);
        $targets = NutritionData::getNutritionTargets($user->id, $partner?->user_id);
        
        $response = NutritionResponseData::build($validated, $targets);
        
        // Cache until end of day (midnight)
        $expiresAt = NutritionResponseData::getCacheExpiration();
        cache()->put($cacheKey, $response, $expiresAt);
        
        return $response;
    }



    private function generateNutritionFromLlm(array $nutritionData, object $user, ?object $partner): array
    {
        $prompts = $this->buildPrompts($nutritionData, $user, $partner);
        $llmResult = $this->callLlm($prompts['system'], $prompts['user'], $nutritionData);
        
        return $this->validateNutritionData($llmResult, $nutritionData, $user, $partner);
    }


    
    private function buildPrompts(array $nutritionData, object $user, ?object $partner): array
    {
        $promptData = NutritionPromptData::extractForPrompts($nutritionData, $user, $partner);
        
        $systemPrompt = NutritionCalculationPrompt::getSystemPrompt();
        $userPrompt = NutritionCalculationPrompt::buildUserPrompt(
            $promptData['userTodayLogs'],
            $promptData['partnerTodayLogs'],
            $promptData['userWeeklyLogs'],
            $promptData['partnerWeeklyLogs'],
            $promptData['userTargets'],
            $promptData['partnerTargets'],
            $promptData['availableRecipes'],
            $promptData['userName'],
            $promptData['userId'],
            $promptData['partnerName'],
            $promptData['partnerUserId']
        );
        
        return [
            'system' => $systemPrompt,
            'user' => $userPrompt,
        ];
    }


    private function callLlm(string $systemPrompt, string $userPrompt, array $nutritionData): array
    {
        $sortedLogs = NutritionPromptData::prepareForSeedGeneration($nutritionData);
        $seed = NutritionPromptData::generateSeed($sortedLogs);
        
        return $this->llmService->generateJson(
            $systemPrompt,
            $userPrompt,
            [
                'temperature' => 0.3, // Lower temperature for more consistent results
                'seed' => $seed, // Deterministic seed based on food logs
            ]
        );
    }


    private function validateNutritionData(array $llmResult, array $nutritionData, object $user, ?object $partner): array
    {
        $partnerInfo = NutritionPromptData::extractPartnerInfo($partner, $nutritionData);
        
        $validated = NutritionCalculationValidator::validateAndSanitize(
            $llmResult,
            $user->id,
            $user->first_name,
            $partnerInfo['partnerUserId'],
            $partnerInfo['partnerName'],
            $partnerInfo['partnerHasFoodLogs']
        );
        
        return $validated;
    }
}