<?php

namespace App\Data;

use Illuminate\Support\Collection;

/**
 * Data class for aggregated analytics response structure
 */
class AnalyticsAggregatedResponseData
{
    public function __construct(
        public readonly array $weekly,
        public readonly array $monthlyMood,
        public readonly array $pantryWaste,
        public readonly array $budgetCategories,
        public readonly Collection $goals,
        public readonly array $budgetSummary,
    ) {}

    public function toArray(): array
    {
        return [
            'weekly' => $this->weekly,
            'monthly_mood' => $this->monthlyMood,
            'pantry_waste' => $this->pantryWaste,
            'budget_categories' => $this->budgetCategories,
            'goals' => $this->goals,
            'budget_summary' => $this->budgetSummary,
        ];
    }
}

