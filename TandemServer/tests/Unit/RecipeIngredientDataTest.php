<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Data\RecipeIngredientData;

class RecipeIngredientDataTest extends TestCase
{
    public function test_prepare_with_all_fields(): void
    {
        $ingredient = [
            'ingredient_name' => 'Tomato',
            'quantity' => 2,
            'unit' => 'pieces',
            'order' => 1,
        ];

        $result = RecipeIngredientData::prepare($ingredient, 0);

        $this->assertEquals('Tomato', $result['ingredient_name']);
        $this->assertEquals(2, $result['quantity']);
        $this->assertEquals('pieces', $result['unit']);
        $this->assertEquals(1, $result['order']);
    }

    public function test_prepare_with_missing_optional_fields(): void
    {
        $ingredient = [
            'ingredient_name' => 'Salt',
        ];

        $result = RecipeIngredientData::prepare($ingredient, 5);

        $this->assertEquals('Salt', $result['ingredient_name']);
        $this->assertNull($result['quantity']);
        $this->assertNull($result['unit']);
        $this->assertEquals(5, $result['order']); // Uses index as order
    }

    public function test_prepare_uses_index_when_order_missing(): void
    {
        $ingredient = [
            'ingredient_name' => 'Pepper',
            'quantity' => 1,
            'unit' => 'tsp',
        ];

        $result = RecipeIngredientData::prepare($ingredient, 3);

        $this->assertEquals(3, $result['order']);
    }

    public function test_prepare_many_processes_multiple_ingredients(): void
    {
        $ingredients = [
            ['ingredient_name' => 'Flour', 'quantity' => 2, 'unit' => 'cups'],
            ['ingredient_name' => 'Sugar', 'quantity' => 1, 'unit' => 'cup'],
            ['ingredient_name' => 'Eggs', 'quantity' => 3, 'unit' => 'pieces'],
        ];

        $result = RecipeIngredientData::prepareMany($ingredients);

        $this->assertCount(3, $result);
        $this->assertEquals('Flour', $result[0]['ingredient_name']);
        $this->assertEquals('Sugar', $result[1]['ingredient_name']);
        $this->assertEquals('Eggs', $result[2]['ingredient_name']);
    }

    public function test_prepare_many_assigns_correct_order(): void
    {
        $ingredients = [
            ['ingredient_name' => 'Item 1'],
            ['ingredient_name' => 'Item 2'],
            ['ingredient_name' => 'Item 3'],
        ];

        $result = RecipeIngredientData::prepareMany($ingredients);

        $this->assertEquals(0, $result[0]['order']);
        $this->assertEquals(1, $result[1]['order']);
        $this->assertEquals(2, $result[2]['order']);
    }

    public function test_prepare_many_with_empty_array(): void
    {
        $result = RecipeIngredientData::prepareMany([]);

        $this->assertIsArray($result);
        $this->assertCount(0, $result);
    }

    public function test_prepare_handles_numeric_quantity(): void
    {
        $ingredient = [
            'ingredient_name' => 'Milk',
            'quantity' => 250,
            'unit' => 'ml',
        ];

        $result = RecipeIngredientData::prepare($ingredient, 0);

        $this->assertEquals(250, $result['quantity']);
    }

    public function test_prepare_handles_string_quantity(): void
    {
        $ingredient = [
            'ingredient_name' => 'Butter',
            'quantity' => '100',
            'unit' => 'g',
        ];

        $result = RecipeIngredientData::prepare($ingredient, 0);

        $this->assertEquals('100', $result['quantity']);
    }
}
