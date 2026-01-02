<?php

namespace App\Services;

use App\Models\HealthLog;
use App\Models\MoodEntry;
use App\Data\MoodEntryData;
use App\Http\Traits\HasAuthenticatedUser;

class HealthLogService
{
    use HasAuthenticatedUser;

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
        
        return $healthLog;
    }

    public function delete(int $id): void
    {
        $healthLog = $this->findHealthLogForUser($id);
        
        $healthLog->delete();
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
}