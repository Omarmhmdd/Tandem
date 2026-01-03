<?php

namespace App\Services;

use App\Models\WeeklySummary;
use App\Http\Traits\VerifiesResourceOwnership;
use Illuminate\Support\Collection;

class WeeklySummaryService
{
    use VerifiesResourceOwnership;

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
}