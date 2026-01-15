<?php

namespace App\Services;

use App\Models\WeeklySummary;
use App\Http\Traits\VerifiesResourceOwnership;
use Illuminate\Support\Collection;
use App\Data\WeeklySummaryData;
use App\Services\LlmOnlyService;
use Config\Prompts\WeeklySummaryPrompt;
use App\Validators\WeeklySummaryValidator;
use Config\LlmConstants;
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
            // Generate summary for the previous completed week (not the current week)
            $weekStart = now()->subWeek()->startOfWeek()->format('Y-m-d');
        }

        $weekEnd = date('Y-m-d', strtotime($weekStart . ' +6 days'));
        $weekData = WeeklySummaryData::collectWeekData($householdMember->household_id, $weekStart, $weekEnd);

        $systemPrompt = WeeklySummaryPrompt::getSystemPrompt();
        $userPrompt = WeeklySummaryPrompt::buildUserPrompt(
            $weekData['healthLogs'],
            $weekData['pantryItems'],
            $weekData['recipes'],
            $weekData['goals'],
            $weekData['moodData'],
            $weekData['budgetData'],
            $weekData['habits'],
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
            WeeklySummaryData::buildWeeklySummaryData($householdMember->household_id, $weekStart, $validated)
        );
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
            // Generate summary for the previous completed week (not the current week)
            $weekStart = now()->subWeek()->startOfWeek()->format('Y-m-d');
        }

        $weekEnd = date('Y-m-d', strtotime($weekStart . ' +6 days'));
        $weekData = WeeklySummaryData::collectWeekData($householdId, $weekStart, $weekEnd);

        $systemPrompt = WeeklySummaryPrompt::getSystemPrompt();
        $userPrompt = WeeklySummaryPrompt::buildUserPrompt(
            $weekData['healthLogs'],
            $weekData['pantryItems'],
            $weekData['recipes'],
            $weekData['goals'],
            $weekData['moodData'],
            $weekData['budgetData'],
            $weekData['habits'],
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
            WeeklySummaryData::buildWeeklySummaryData($householdId, $weekStart, $validated)
        );
    }
}