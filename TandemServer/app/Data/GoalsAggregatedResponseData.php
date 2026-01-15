<?php

namespace App\Data;

use Illuminate\Support\Collection;


class GoalsAggregatedResponseData
{
    public function __construct(
        public readonly Collection $goals,
        public readonly array $budgetSummary,
    ) {}

    public static function from(array $data): self
    {
        return new self(
            goals: $data['goals'],
            budgetSummary: $data['budgetSummary'],
        );
    }

    public function toArray(): array
    {
        return [
            'goals' => $this->goals,
            'budget_summary' => $this->budgetSummary,
        ];
    }
}

