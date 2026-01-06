<?php

namespace App\Data;

use App\Models\Budget;

class BudgetSummaryData
{
    public static function toArray(?Budget $budget, float $totalExpenses): array
    {
        return [
            'budget' => $budget ? $budget->toArray() : null,
            'total_expenses' => $totalExpenses,
            'remaining' => $budget ? (float) ($budget->monthly_budget - $totalExpenses) : null,
        ];
    }

    public static function empty(): array
    {
        return [
            'budget' => null,
            'total_expenses' => 0,
            'remaining' => null,
        ];
    }
}