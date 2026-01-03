<?php

namespace App\Data;

class ExpenseData
{
    public static function prepare(array $expenseData): array
    {
        if (!isset($expenseData['category']) || empty($expenseData['category'])) {
            $expenseData['category'] = 'other';
        }

        $expenseData['auto_tagged'] = $expenseData['auto_tagged'] ?? false;

        return $expenseData;
    }
}