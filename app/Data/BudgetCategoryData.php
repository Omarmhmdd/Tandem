<?php

namespace App\Data;

class BudgetCategoryData
{
    public static function entry(string $category, float $amount, float $budget = 0.0): array
    {
        return [
            'category' => ucfirst($category),
            'amount' => $amount,
            'budget' => $budget,
        ];
    }
}