<?php

namespace App\Services;

use App\Models\DateNightSuggestion;
use App\Models\Budget;
use App\Models\Expense;
use App\Models\MealPlan;
use App\Models\Recipe;
use App\Constants\DefaultValues;
use Config\LlmConstants;
use App\Data\DateNightData;
use App\Http\Traits\VerifiesResourceOwnership;
use App\Services\LlmOnlyService;
use Config\Prompts\DateNightPrompt;
use App\Validators\DateNightSuggestionValidator;

class DateNightService
{
    use VerifiesResourceOwnership;

    public function __construct(
        private LlmOnlyService $llmService
    ) {}

    public function getSuggestions(): \Illuminate\Support\Collection
    {
        $householdMember = $this->getActiveHouseholdMemberOrNull();

        if (!$householdMember) {
            return collect([]);
        }

        return DateNightSuggestion::where('household_id', $householdMember->household_id)
            ->where('status', DateNightSuggestion::STATUS_PENDING)
            ->where('suggested_at', '>=', now()->format('Y-m-d'))
            ->orderBy('suggested_at', 'asc')
            ->get();
    }

    public function getAcceptedDateNights(): \Illuminate\Support\Collection
    {
        $householdMember = $this->getActiveHouseholdMemberOrNull();

        if (!$householdMember) {
            return collect([]);
        }

        return DateNightSuggestion::where('household_id', $householdMember->household_id)
            ->where('status', DateNightSuggestion::STATUS_ACCEPTED)
            ->where('suggested_at', '>=', now()->format('Y-m-d'))
            ->orderBy('suggested_at', 'asc')
            ->get();
    }

    public function generate(?string $suggestedAt = null, ?float $userBudget = null): DateNightSuggestion
    {
        $householdMember = $this->getActiveHouseholdMember();
        $suggestedAt = $this->prepareDateForSuggestion($suggestedAt);
        $budget = $this->calculateBudget($householdMember->household_id, $userBudget);
        
        $validated = $this->generateSuggestionFromLlm(
            $householdMember->household_id,
            $budget,
            $suggestedAt
        );

        return $this->createSuggestion($householdMember->household_id, $suggestedAt, $validated);
    }

    public function acceptSuggestion(int $suggestionId, string $date): DateNightSuggestion
    {
        $householdMember = $this->getActiveHouseholdMember();
        $user = $this->getAuthenticatedUser();
        $suggestion = $this->findSuggestion($suggestionId, $householdMember->household_id);

        $this->validateSuggestionNotAccepted($suggestion);
        $suggestion->update(['status' => DateNightSuggestion::STATUS_ACCEPTED]);

        $this->createMealPlanFromSuggestion($suggestion, $householdMember->household_id, $user->id, $date);
        $this->createExpenseFromSuggestion($suggestion, $householdMember->household_id, $user->id);

        return $suggestion->fresh();
    }

    private function prepareDateForSuggestion(?string $suggestedAt): string
    {
        return $suggestedAt ?? now()->format('Y-m-d');
    }

    private function calculateBudget(int $householdId, ?float $userBudget): float
    {
        if ($userBudget !== null) {
            return $this->ensureMinimumBudget($userBudget);
        }

        $calculatedBudget = $this->calculateBudgetFromHousehold($householdId);
        return $this->ensureMinimumBudget($calculatedBudget);
    }

    private function calculateBudgetFromHousehold(int $householdId): float
    {
        $budget = Budget::where('household_id', $householdId)->first();
        if (!$budget) {
            return LlmConstants::DATE_NIGHT_FALLBACK_BUDGET;
        }

        $monthlyExpenses = $this->getMonthlyExpenses($householdId);
        $remaining = ($budget->monthly_budget ?? 0) - $monthlyExpenses;
        
        return max(0, $remaining / 4);
    }

    private function getMonthlyExpenses(int $householdId): float
    {
        return Expense::where('household_id', $householdId)
            ->whereMonth('date', now()->month)
            ->whereYear('date', now()->year)
            ->sum('amount');
    }

    private function ensureMinimumBudget(float $budget): float
    {
        return max($budget, LlmConstants::DATE_NIGHT_MIN_BUDGET);
    }

    private function generateSuggestionFromLlm(int $householdId, float $budget, string $suggestedAt): array
    {
        $dateNightData = $this->collectDateNightData($householdId);
        $prompts = $this->buildPrompts($budget, $dateNightData, $suggestedAt);
        $llmResult = $this->callLlm($prompts['system'], $prompts['user']);
        
        return DateNightSuggestionValidator::validateAndSanitize($llmResult);
    }

    private function collectDateNightData(int $householdId): array
    {
        $pantryItems = DateNightData::getPantryItems($householdId);
        $recipes = DateNightData::getAvailableRecipes($householdId);
        
        $this->shuffleArrays($pantryItems, $recipes);

        return [
            'moodData' => DateNightData::getRecentMoodData($householdId),
            'pantryItems' => $pantryItems,
            'recipes' => $recipes,
            'recentSuggestions' => DateNightData::getRecentSuggestions($householdId),
        ];
    }

    private function shuffleArrays(array &$pantryItems, array &$recipes): void
    {
        shuffle($pantryItems);
        shuffle($recipes);
    }

    private function buildPrompts(float $budget, array $dateNightData, string $suggestedAt): array
    {
        return [
            'system' => DateNightPrompt::getSystemPrompt(),
            'user' => DateNightPrompt::buildUserPrompt(
                $budget,
                $dateNightData['moodData'],
                $dateNightData['pantryItems'],
                $dateNightData['recipes'],
                $suggestedAt,
                $dateNightData['recentSuggestions']
            ),
        ];
    }

    private function callLlm(string $systemPrompt, string $userPrompt): array
    {
        return $this->llmService->generateJson(
            $systemPrompt,
            $userPrompt,
            [
                'temperature' => LlmConstants::TEMPERATURE_VARIETY,
                'seed' => $this->generateSeed(),
            ]
        );
    }

    private function createSuggestion(int $householdId, string $suggestedAt, array $validated): DateNightSuggestion
    {
        $this->validateSuggestionData($validated);

        return DateNightSuggestion::create(
            DateNightData::buildSuggestionData($householdId, $suggestedAt, $validated)
        );
    }

    private function validateSuggestionData(array $validated): void
    {
        if (!$validated['meal'] || !$validated['activity'] || !$validated['treat'] || !$validated['total_cost']) {
            throw new \Exception('Invalid date night suggestion data from AI');
        }
    }

    private function findSuggestion(int $suggestionId, int $householdId): DateNightSuggestion
    {
        return DateNightSuggestion::where('id', $suggestionId)
            ->where('household_id', $householdId)
            ->firstOrFail();
    }

    private function validateSuggestionNotAccepted(DateNightSuggestion $suggestion): void
    {
        if ($suggestion->status === DateNightSuggestion::STATUS_ACCEPTED) {
            throw new \Exception('This suggestion has already been accepted.');
        }
    }

    private function generateSeed(): int
    {
        return (int)(microtime(true) * 1000) % 100000;
    }

        private function createMealPlanFromSuggestion(DateNightSuggestion $suggestion, int $householdId, int $userId, string $date): void
    {
        $recipeId = $this->findRecipeByName($suggestion->meal['name'] ?? null, $householdId);
        DateNightData::createOrUpdateMealPlan($suggestion, $householdId, $userId, $recipeId, $date);
    }

    private function createExpenseFromSuggestion(DateNightSuggestion $suggestion, int $householdId, int $userId): void
    {
        Expense::create(DateNightData::buildExpenseData($suggestion, $householdId, $userId));
    }

    private function findRecipeByName(?string $mealName, int $householdId): ?int
    {
        if (!$mealName) {
            return null;
        }

        $recipe = Recipe::where('household_id', $householdId)
            ->where('name', 'like', '%' . $mealName . '%')
            ->first();

        return $recipe?->id;
    }
}