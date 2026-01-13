<?php

namespace App\Services;

use App\Models\MoodEntry;
use App\Http\Traits\VerifiesResourceOwnership;
use App\Models\MoodAnnotation;
use App\Models\HealthLog;
use App\Constants\DefaultValues;
use App\Services\LlmOnlyService;
use Config\LlmConstants;
use Config\Prompts\MoodAnnotationPrompt;
use App\Validators\MoodAnnotationValidator;
class MoodService
{
    use VerifiesResourceOwnership;
    
    public function __construct(private LlmOnlyService $llmService) {}
    public function getTimeline(?string $startDate = null, ?string $endDate = null): \Illuminate\Support\Collection
    {
        $householdMember = $this->getActiveHouseholdMemberOrNull();

        if (!$householdMember) {
            return collect([]);
        }

        $query = MoodEntry::whereIn('user_id', $this->getHouseholdUserIds($householdMember->household_id));
        $this->applyDateFilters($query, $startDate, $endDate);

        return $query->with('user')
            ->orderBy('date', 'desc')
            ->orderBy('time', 'desc')
            ->get();
    }

        public function getComparison(?string $startDate = null, ?string $endDate = null): array
    {
        $householdMember = $this->getActiveHouseholdMemberOrNull();
        $user = $this->getAuthenticatedUser();

        if (!$householdMember) {
            return [
                'user' => collect([]),
                'partner' => collect([]),
            ];
        }

        $partner = $this->getPartner();

        $userEntries = $this->getUserMoodEntries($user->id, $startDate, $endDate);
        $partnerEntries = $partner 
            ? $this->getUserMoodEntries($partner->user_id, $startDate, $endDate)
            : collect([]);

        return [
            'user' => $userEntries,
            'partner' => $partnerEntries,
        ];
    }

    public function createEntry(array $moodEntryData): MoodEntry
    {
        return MoodEntry::create($moodEntryData);
    }
//helper methods for clean code 
    protected function getHouseholdUserIds(int $householdId): \Closure
    {
        return function ($query) use ($householdId) {
            $query->select('user_id')
                ->from('household_members')
                ->where('household_id', $householdId)
                ->where('status', 'active')
                ->whereNotNull('user_id');
        };
    }

    protected function applyDateFilters($query, ?string $startDate, ?string $endDate): void
    {
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }

        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
    }

    protected function getUserMoodEntries(int $userId, ?string $startDate, ?string $endDate): \Illuminate\Support\Collection
    {
        $query = MoodEntry::where('user_id', $userId);
        $this->applyDateFilters($query, $startDate, $endDate);

        return $query->get();
    }


//AI feature moodtimeline 
public function autoAnnotate(?string $startDate = null, ?string $endDate = null): \Illuminate\Support\Collection
{
    $householdMember = $this->getActiveHouseholdMember();
    [$startDate, $endDate] = $this->prepareDateRange($startDate, $endDate);

    // Get existing annotations for the requested date range (use distinct to prevent duplicates)
    $existingAnnotations = MoodAnnotation::where('household_id', $householdMember->household_id)
        ->whereBetween('date', [$startDate, $endDate])
        ->orderBy('date', 'desc')
        ->orderBy('id', 'desc')
        ->get()
        ->unique(function ($annotation) {
            return $annotation->date . '|' . $annotation->title . '|' . $annotation->type;
        })
        ->values();

    // If annotations already exist for this date range, return them (avoid regenerating)
    if ($existingAnnotations->isNotEmpty()) {
        return $existingAnnotations;
    }

    // Only generate new annotations if none exist for this date range
    $moodEntries = $this->getMoodEntries($householdMember->household_id, $startDate, $endDate);
    $healthLogs = $this->getHealthLogs($householdMember->household_id, $startDate, $endDate);
    $expenses = $this->getExpenses($householdMember->household_id, $startDate, $endDate);

    if (empty($moodEntries) && empty($healthLogs) && empty($expenses)) {
        return collect([]); // No data, no annotations
    }

    $validatedAnnotations = $this->generateAnnotationsFromData($moodEntries, $healthLogs, $expenses, $startDate, $endDate);

    return $this->createAnnotationsFromValidated($validatedAnnotations, $householdMember->household_id)
        ->sortByDesc('date')
        ->sortByDesc('id')
        ->values();
}
//helper methods for thus feature
private function prepareDateRange(?string $startDate, ?string $endDate): array
{
    if (!$startDate) {
        $startDate = now()->subDays(LlmConstants::MOOD_ANNOTATION_DAYS)->format('Y-m-d');
    }
    if (!$endDate) {
        $endDate = now()->format('Y-m-d');
    }

    return [$startDate, $endDate];
}
private function generateAnnotationsFromData(array $moodEntries, array $healthLogs,array $expenses, string $startDate, string $endDate): array
{
    $systemPrompt = MoodAnnotationPrompt::getSystemPrompt();
    $userPrompt = MoodAnnotationPrompt::buildUserPrompt($moodEntries,
        $healthLogs,
         $expenses, 
        $startDate,
        $endDate
    );

    $result = $this->llmService->generateJson(
        $systemPrompt,
        $userPrompt,
        ['temperature' => LlmConstants::TEMPERATURE_ANALYSIS]
    );

    return MoodAnnotationValidator::validateAndSanitize($result);
}
private function createAnnotationsFromValidated(array $validatedAnnotations, int $householdId): \Illuminate\Support\Collection
{
    // First, deduplicate within the current batch (same date, title, type)
    $deduplicated = [];
    $seen = [];
    foreach ($validatedAnnotations as $annotation) {
        $key = $annotation['date'] . '|' . $annotation['title'] . '|' . $annotation['type'];
        if (!isset($seen[$key])) {
            $seen[$key] = true;
            $deduplicated[] = $annotation;
        }
    }
    
    $annotations = collect([]);
    foreach ($deduplicated as $annotation) {
        // Check if annotation with same date, title, type, and household already exists in database
        $existing = MoodAnnotation::where('household_id', $householdId)
            ->where('date', $annotation['date'])
            ->where('title', $annotation['title'])
            ->where('type', $annotation['type'])
            ->first();
        
        if ($existing) {
            // Skip creating duplicate - don't add to collection, it will be merged from existing annotations
            continue;
        }
        
        $created = MoodAnnotation::create(
            $this->buildAnnotationData($annotation, $householdId)
        );
        $annotations->push($created);
    }

    return $annotations;
}
private function buildAnnotationData(array $annotation, int $householdId): array
{
    return [
        'household_id' => $householdId,
        'date' => $annotation['date'],
        'type' => $annotation['type'],
        'title' => $annotation['title'],
        'description' => $annotation['text'],
    ];
}
private function getMoodEntries(int $householdId, string $startDate, string $endDate): array
{
    return MoodEntry::whereIn('user_id', function ($q) use ($householdId) {
        $q->select('user_id')
                ->from('household_members')
                ->where('household_id', $householdId)
                ->where('status', 'active');
    })
    ->whereBetween('date', [$startDate, $endDate])
    ->orderBy('date', 'desc')
    ->get()
    ->map(fn($entry) => [
        'date' => $entry->date->format('Y-m-d'),
        'mood' => $entry->mood,
        'notes' => $entry->notes,
    ])
    ->toArray();

}

private function getHealthLogs(int $householdId, string $startDate, string $endDate): array
{
    return HealthLog::whereHas('user.householdMembers', function ($q) use ($householdId) {
        $q->where('household_id', $householdId)->where('status', 'active');
    })
    ->whereBetween('date', [$startDate, $endDate])
    ->orderBy('date', 'desc')
    ->get()
    ->map(fn($log) => [
        'date' => $log->date->format('Y-m-d'),
        'activities' => $log->activities ?? [],
        'food' => $log->food ?? [],
        'sleep_hours' => $log->sleep_hours,
        'notes' => $log->notes,
    ])
    ->toArray();
}

private function getExpenses(int $householdId, string $startDate, string $endDate): array
{
    return \App\Models\Expense::where('household_id', $householdId)
        ->whereBetween('date', [$startDate, $endDate])
        ->orderBy('date', 'desc')
        ->orderBy('amount', 'desc')
        ->get()
        ->map(fn($expense) => [
            'date' => $expense->date->format('Y-m-d'),
            'amount' => (float) $expense->amount,
            'description' => $expense->description,
            'category' => $expense->category,
        ])
        ->toArray();
}

}