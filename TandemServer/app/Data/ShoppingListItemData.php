<?php

namespace App\Data;

use App\Models\ShoppingList;
use App\Models\PantryItem;

class ShoppingListItemData
{
    public static function prepare(
        ShoppingList $shoppingList,
        array $ingredient,
        ?PantryItem $pantryItem,
        float $actualNeeded
    ): array {
        return [
            'shopping_list_id' => $shoppingList->id,
            'name' => $ingredient['ingredient_name'],
            'quantity' => $actualNeeded,
            'unit' => $ingredient['unit'],
            'in_pantry' => $pantryItem !== null,
            'pantry_item_id' => $pantryItem?->id,
            'purchased' => false,
        ];
    }
}