<?php

namespace App\Services;

use App\Models\MoodEntry;
use App\Http\Traits\VerifiesResourceOwnership;
use Illuminate\Database\Eloquent\Builder;

class MoodService
{
    use VerifiesResourceOwnership;

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
}