<?php

namespace App\Services;

use App\Models\WeeklySummary;
use App\Http\Traits\VerifiesResourceOwnership;
use Illuminate\Support\Collection;
use App\Models\HealthLog;
use App\Models\PantryItem;
use App\Models\Recipe;
use App\Models\Goal;
use App\Models\MoodEntry;
use App\Models\Expense;
use App\Models\Budget;
use App\Services\LlmOnlyService;
use App\Services\Prompts\WeeklySummaryPrompt;
use App\Validators\WeeklySummaryValidator;
use App\Constants\LlmConstants;
use Exception;
use App\Models\Household;
class WeeklySummaryService
{
    use VerifiesResourceOwnership;
    public function __construct(
    private LlmOnlyService $llmService
) {}
    public function getAll(): Collection
    {
        $householdMember = $this->getActiveHouseholdMemberOrNull();

        if (!$householdMember) {
            return collect([]);
        }

        return WeeklySummary::where('household_id', $householdMember->household_id)
            ->orderBy('week_start', 'desc')
            ->get();
    }
    

    public function generate(?string $weekStart = null): WeeklySummary
{
    $householdMember = $this->getActiveHouseholdMember();

    if (!$weekStart) {
        $weekStart = now()->startOfWeek()->format('Y-m-d');
    }

    $weekEnd = date('Y-m-d', strtotime($weekStart . ' +6 days'));
    $weekData = $this->collectWeekData($householdMember->household_id, $weekStart, $weekEnd);

    $systemPrompt = WeeklySummaryPrompt::getSystemPrompt();
    $userPrompt = WeeklySummaryPrompt::buildUserPrompt(
        $weekData['healthLogs'],
        $weekData['pantryItems'],
        $weekData['recipes'],
        $weekData['goals'],
        $weekData['moodData'],
        $weekData['budgetData'],
        $weekStart
    );

    $result = $this->llmService->generateJson(
        $systemPrompt,
        $userPrompt,
        ['temperature' => LlmConstants::TEMPERATURE_CREATIVE]
    );

    $validated = WeeklySummaryValidator::validateAndSanitize($result);

    return WeeklySummary::updateOrCreate(
    [
        'household_id' => $householdMember->household_id,
        'week_start' => $weekStart,
    ],
    $this->buildWeeklySummaryData($householdMember->household_id, $weekStart, $validated));
}
    private function collectWeekData(int $householdId, string $weekStart, string $weekEnd): array
{
    return [
        'healthLogs' => $this->getHealthLogsForWeek($householdId, $weekStart, $weekEnd),
        'pantryItems' => $this->getPantryItems($householdId),
        'recipes' => $this->getRecipesUsed($householdId, $weekStart, $weekEnd),
        'goals' => $this->getGoals($householdId),
        'moodData' => $this->getMoodData($householdId, $weekStart, $weekEnd),
        'budgetData' => $this->getBudgetData($householdId, $weekStart, $weekEnd),
    ];
}

private function buildWeeklySummaryData(int $householdId, string $weekStart, array $validated): array
{
    return [
        'household_id' => $householdId,
        'week_start' => $weekStart,
        'highlight' => $validated['highlight'],
        'bullets' => $validated['bullets'],
        'action' => $validated['action'],
        'generated_at' => now(),
    ];
}

 private function getHealthLogsForWeek(int $householdId, string $weekStart, string $weekEnd): array
{
    return HealthLog::whereHas('user.householdMembers', function ($q) use ($householdId) {
        $q->where('household_id', $householdId)->where('status', 'active');
    })
    ->whereBetween('date', [$weekStart, $weekEnd])
    ->get()
    ->map(fn($log) => [
        'date' => $log->date->format('Y-m-d'),
        'activities' => $log->activities ?? [],
        'food' => $log->food ?? [],
        'sleep_hours' => $log->sleep_hours,
        'mood' => $log->mood,
        'notes' => $log->notes,
    ])
    ->toArray();
}

private function getPantryItems(int $householdId): array
{
    return PantryItem::where('household_id', $householdId)
        ->get()
        ->map(function ($item) {
            $expiryDate = $item->expiry_date;
            if ($expiryDate instanceof \Carbon\Carbon) {
                $formattedDate = $expiryDate->format('Y-m-d');
            } else {
                $formattedDate = null;
            }
            return [
                'name' => $item->name,
                'expiry_date' => $formattedDate,
            ];
        })
        ->toArray();
}

private function getRecipesUsed(int $householdId, string $weekStart, string $weekEnd): array
{
    return Recipe::where('household_id', $householdId)
        ->whereHas('mealPlans', function ($q) use ($weekStart, $weekEnd) {
            $q->whereBetween('date', [$weekStart, $weekEnd]);
        })
        ->get()
        ->map(fn($recipe) => [
            'id' => $recipe->id,
            'name' => $recipe->name,
        ])
        ->toArray();
}

private function getGoals(int $householdId): array
{
    return Goal::where(function ($q) use ($householdId) {
        $q->where('household_id', $householdId)
            ->orWhereHas('user.householdMembers', function ($q) use ($householdId) {
                $q->where('household_id', $householdId)->where('status', 'active');
            });
    })
    ->get()
    ->map(fn($goal) => [
        'title' => $goal->title,
        'current' => $goal->current,
        'target' => $goal->target,
    ])
    ->toArray();
}

private function getMoodData(int $householdId, string $weekStart, string $weekEnd): array
{
    return MoodEntry::whereIn('user_id', function ($q) use ($householdId) {
        $q->select('user_id')
            ->from('household_members')
            ->where('household_id', $householdId)
            ->where('status', 'active');
    })
    ->whereBetween('date', [$weekStart, $weekEnd])
    ->get()
    ->map(fn($entry) => [
        'date' => $entry->date->format('Y-m-d'),
        'mood' => $entry->mood,
    ])
    ->toArray();
}

private function getBudgetData(int $householdId, string $weekStart, string $weekEnd): array
{
    $budget = Budget::where('household_id', $householdId)->first();
    $totalExpenses = Expense::where('household_id', $householdId)
        ->whereBetween('date', [$weekStart, $weekEnd])
        ->sum('amount');

    return [
        'budget' => $budget?->monthly_budget,
        'total_expenses' => $totalExpenses,
    ];
}


public function generateForHousehold(int $householdId, ?string $weekStart = null): WeeklySummary
{
    $household = Household::find($householdId);
    if (!$household) {
        throw new Exception('Household not found');
    }

    $householdMember = \App\Models\HouseholdMember::where('household_id', $householdId)
        ->where('status', 'active')
        ->with('user')
        ->first();

    if (!$householdMember) {
        throw new Exception('No active members in household');
    }

    $this->authenticatedUser = $householdMember->user;
    $this->activeHouseholdMember = $householdMember;

    if (!$weekStart) {
        $weekStart = now()->startOfWeek()->format('Y-m-d');
    }

    $weekEnd = date('Y-m-d', strtotime($weekStart . ' +6 days'));
    $weekData = $this->collectWeekData($householdId, $weekStart, $weekEnd);

    $systemPrompt = WeeklySummaryPrompt::getSystemPrompt();
    $userPrompt = WeeklySummaryPrompt::buildUserPrompt(
        $weekData['healthLogs'],
        $weekData['pantryItems'],
        $weekData['recipes'],
        $weekData['goals'],
        $weekData['moodData'],
        $weekData['budgetData'],
        $weekStart
    );

    $result = $this->llmService->generateJson(
        $systemPrompt,
        $userPrompt,
        ['temperature' => LlmConstants::TEMPERATURE_CREATIVE]
    );

    $validated = WeeklySummaryValidator::validateAndSanitize($result);

    return WeeklySummary::updateOrCreate(
        [
            'household_id' => $householdId,
            'week_start' => $weekStart,
        ],
        $this->buildWeeklySummaryData($householdId, $weekStart, $validated)
    );
}
}