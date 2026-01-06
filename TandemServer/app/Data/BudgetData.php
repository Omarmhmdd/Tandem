<?php

namespace App\Data;

use App\Models\Budget;

class BudgetData
{

    public static function prepare(array $budgetData): array
    {
        return [
            'year' => isset($budgetData['year']) ? (int) $budgetData['year'] : (int) now()->year,
            'month' => isset($budgetData['month']) ? (int) $budgetData['month'] : (int) now()->month,
            'monthly_budget' => (float) $budgetData['monthly_budget'],
        ];
    }

    public static function getSearchCriteria(int $householdId, array $preparedData): array
    {
        return [
            'household_id' => $householdId,
            'year' => $preparedData['year'],
            'month' => $preparedData['month'],
        ];
    }

    public static function getUpdateData(?Budget $existingBudget, array $preparedData, int $userId): array
    {
        return [
            'monthly_budget' => $preparedData['monthly_budget'],
            'created_by_user_id' => $existingBudget?->created_by_user_id ?? $userId,
            'updated_by_user_id' => $userId,
        ];
    }
}