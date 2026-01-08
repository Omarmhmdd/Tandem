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
        return [
            'userFoodLogs' => NutritionData::getFoodLogs($userId),
            'partnerFoodLogs' => $partner && $partner->user_id 
                ? NutritionData::getFoodLogs($partner->user_id)
                : [],
            'targets' => NutritionData::getNutritionTargets($userId, $partner?->user_id),
            'availableRecipes' => NutritionData::getAvailableRecipes($householdId),
        ];
    }

    // Generates nutrition calculation from LLM
    private function generateNutritionFromLlm(array $nutritionData, object $user, ?object $partner): array
    {
        $prompts = $this->buildPrompts($nutritionData, $user, $partner);
        $llmResult = $this->callLlm($prompts['system'], $prompts['user']);
        
        return $this->validateNutritionData($llmResult, $user, $partner);
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
        $partnerName = $partner && $partner->user ? $partner->user->first_name : 'Partner';
        
        $systemPrompt = NutritionCalculationPrompt::getSystemPrompt();
        $userPrompt = NutritionCalculationPrompt::buildUserPrompt($userFoodLogs,$partnerFoodLogs,$userTargets,$partnerTargets,$availableRecipes,$userName,$partnerName);
        
        return [
            'system' => $systemPrompt,
            'user' => $userPrompt,
        ];
    }

    // Calls LLM service to generate nutrition calculation
    private function callLlm(string $systemPrompt, string $userPrompt): array
    {
        return $this->llmService->generateJson(
            $systemPrompt,
            $userPrompt,
            ['temperature' => LlmConstants::TEMPERATURE_CALCULATION]
        );
    }

    // Validates and sanitizes LLM response
    private function validateNutritionData(array $llmResult, object $user, ?object $partner): array
    {
        $partnerUserId = $partner && $partner->user_id ? $partner->user_id : null;
        $partnerName = $partner && $partner->user ? $partner->user->first_name : null;
        
        return NutritionCalculationValidator::validateAndSanitize(
            $llmResult,
            $user->id,
            $user->first_name,
            $partnerUserId,
            $partnerName
        );
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