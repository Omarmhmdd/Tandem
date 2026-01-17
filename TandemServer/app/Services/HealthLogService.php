<?php

namespace App\Services;

use App\Models\HealthLog;
use App\Models\MoodEntry;
use App\Data\MoodEntryData;
use App\Http\Traits\HasAuthenticatedUser;
use App\Services\LlmOnlyService;
use Config\Prompts\HealthLogParsingPrompt;
use App\Validators\HealthLogParsedDataValidator;
use Config\LlmConstants;

class HealthLogService
{
    use HasAuthenticatedUser;

    public function __construct(
    private LlmOnlyService $llmService
) {}

    public function getAll(?string $startDate = null, ?string $endDate = null): \Illuminate\Support\Collection
    {
        $user = $this->getAuthenticatedUser();

        $query = HealthLog::where('user_id', $user->id);

        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }

        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }

        return $query->orderBy('date', 'desc')
            ->orderBy('time', 'desc')
            ->get();
    }

    public function create(array $healthLogData): HealthLog
    {
        $healthLog = HealthLog::create($healthLogData);
        
        $this->createMoodEntryIfProvided($healthLogData);
        
        // Invalidate nutrition cache if food was logged
        // CRITICAL: When a new food log is created, the timestamp changes
        // This means the cache key will be different, but we need to ensure
        // the frontend refetches. The new timestamp will create a new cache key automatically.
        // No need to manually clear - the cache key is based on last timestamp, so it will change.
        
        return $healthLog;
    }

    public function delete(int $id): void
    {
        $healthLog = $this->findHealthLogForUser($id);
        $userId = $healthLog->user_id;
        // Ensure date is formatted as string for comparison (handles both string and Carbon date)
        $date = $healthLog->date instanceof \Carbon\Carbon 
            ? $healthLog->date->format('Y-m-d') 
            : $healthLog->date;
        $hasMood = $healthLog->mood !== null;
        
        $healthLog->delete();
        
        // If the deleted health log had a mood, update or delete the mood entry
        if ($hasMood) {
            $remainingHealthLog = HealthLog::where('user_id', $userId)
                ->where('date', $date)
                ->whereNotNull('mood')
                ->orderBy('time', 'desc')
                ->first();
            
            if ($remainingHealthLog) {
                // Update mood entry to match the remaining health log's mood
                MoodEntry::updateOrCreate(
                    ['user_id' => $userId, 'date' => $date],
                    [
                        'mood' => $remainingHealthLog->mood,
                        'time' => $remainingHealthLog->time,
                        'notes' => $remainingHealthLog->notes,
                    ]
                );
            } else {
                // No other health logs with mood exist, delete the mood entry
                MoodEntry::where('user_id', $userId)
                    ->where('date', $date)
                    ->delete();
            }
        }
    }

    protected function findHealthLogForUser(int $id): HealthLog
    {
        $user = $this->getAuthenticatedUser();
        
        return HealthLog::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();
    }

    protected function createMoodEntryIfProvided(array $healthLogData): void
    {
        if (!isset($healthLogData['mood']) || $healthLogData['mood'] === null || !isset($healthLogData['user_id'])) {
            return;
        }

        $this->createOrUpdateMoodEntry($healthLogData);
    }

    protected function createOrUpdateMoodEntry(array $healthLogData): void
    {
        MoodEntry::updateOrCreate(
            MoodEntryData::getSearchCriteria($healthLogData),
            MoodEntryData::getUpdateData($healthLogData)
        );
    }

    public function parseText(string $text, ?string $userMood = null): array
{
    $systemPrompt = HealthLogParsingPrompt::getSystemPrompt();
    $userPrompt = HealthLogParsingPrompt::buildUserPrompt($text, $userMood);

    $result = $this->llmService->generateJson($systemPrompt,$userPrompt,  [ 'temperature' => LlmConstants::TEMPERATURE_CALCULATION,]
    );
    return HealthLogParsedDataValidator::validateAndSanitize($result);
}

}