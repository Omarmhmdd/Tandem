<?php

namespace App\Data;

use Illuminate\Support\Collection;


class BudgetAggregatedResponseData
{
    public function __construct(
        public readonly Collection $expenses,
        public readonly array $budgetSummary,
    ) {}

    public static function from(array $data): self
    {
        return new self(
            expenses: $data['expenses'],
            budgetSummary: $data['budgetSummary'],
        );
    }

    public function toArray(): array
    {
        return [
            'expenses' => $this->expenses,
            'budget_summary' => $this->budgetSummary,
        ];
    }
}

