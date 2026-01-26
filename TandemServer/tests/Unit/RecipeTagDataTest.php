<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Data\RecipeTagData;

class RecipeTagDataTest extends TestCase
{
    public function test_prepare_returns_tag_unchanged(): void
    {
        $result = RecipeTagData::prepare('vegetarian');

        $this->assertEquals('vegetarian', $result);
    }

    public function test_prepare_many_returns_array_unchanged(): void
    {
        $tags = ['vegan', 'gluten-free', 'quick'];

        $result = RecipeTagData::prepareMany($tags);

        $this->assertEquals($tags, $result);
        $this->assertCount(3, $result);
    }

    public function test_prepare_many_with_empty_array(): void
    {
        $result = RecipeTagData::prepareMany([]);

        $this->assertIsArray($result);
        $this->assertCount(0, $result);
    }

    public function test_prepare_handles_special_characters(): void
    {
        $result = RecipeTagData::prepare('low-carb');

        $this->assertEquals('low-carb', $result);
    }

    public function test_prepare_many_preserves_order(): void
    {
        $tags = ['dessert', 'breakfast', 'lunch'];

        $result = RecipeTagData::prepareMany($tags);

        $this->assertEquals('dessert', $result[0]);
        $this->assertEquals('breakfast', $result[1]);
        $this->assertEquals('lunch', $result[2]);
    }
}
