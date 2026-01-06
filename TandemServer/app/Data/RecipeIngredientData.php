<?php

namespace App\Data;

class RecipeIngredientData
{

    public static function prepare(array $ingredient, int $index): array
    {
        return [
            'ingredient_name' => $ingredient['ingredient_name'],
            'quantity' => $ingredient['quantity'] ?? null,
            'unit' => $ingredient['unit'] ?? null,
            'order' => $ingredient['order'] ?? $index,
        ];
    }

    public static function prepareMany(array $ingredients): array
    {
        return array_map(function ($ingredient, $index) {
            return self::prepare($ingredient, $index);
        }, $ingredients, array_keys($ingredients));
    }
}