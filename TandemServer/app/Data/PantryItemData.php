<?php

namespace App\Data;

use App\Constants\AutoOrderConstants;

class PantryItemData
{
    public static function forAutoOrder(
        string $itemName,
        float $quantity,
        string $unit,
        array $categorization,
        int $householdId,
        int $userId
    ): array {
        // Set default expiry date: today + DEFAULT_EXPIRY_DAYS
        $expiryDate = now()->addDays(AutoOrderConstants::DEFAULT_EXPIRY_DAYS)->format('Y-m-d');

        return [
            'household_id' => $householdId,
            'name' => $itemName,
            'quantity' => $quantity,
            'unit' => $unit,
            'category' => $categorization['category'] ?? AutoOrderConstants::DEFAULT_CATEGORY,
            'location' => $categorization['location'] ?? AutoOrderConstants::DEFAULT_LOCATION,
            'expiry_date' => $expiryDate,
            'created_by_user_id' => $userId,
            'updated_by_user_id' => $userId,
        ];
    }
}