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
        $userLastTimestamp = NutritionData::getLastFoodLogTimestamp($user->id);
        $partnerLastTimestamp = $partner?->user_id ? NutritionData::getLastFoodLogTimestamp($partner->user_id) : null;
        $cacheKey = NutritionResponseData::generateCacheKey($user->id,$partner?->user_id,$userLastTimestamp,$partnerLastTimestamp);
        
        $cached = cache()->get($cacheKey);
        if ($cached !== null) {
            // Apply fix to cached response too (in case cache was created before fix was deployed)
            $targets = NutritionData::getNutritionTargets($user->id, $partner?->user_id);
            if (!empty($cached['recommendations']) && !empty($cached['partnersIntake'])) {
                $fixed = NutritionResponseData::fixRecommendationsWithCorrectMath(
                    ['recommendations' => $cached['recommendations'], 'partnersIntake' => $cached['partnersIntake']],
                    $targets,
                    $user->first_name
                );
                $cached['recommendations'] = $fixed['recommendations'];
            }
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
                'temperature' => 0.3, 
                'seed' => $seed,
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
        
        // Fix recommendations with correct math calculations
        $targets = $nutritionData['targets'];
        $validated = NutritionResponseData::fixRecommendationsWithCorrectMath($validated, $targets, $user->first_name);
        
        return $validated;
    }
}