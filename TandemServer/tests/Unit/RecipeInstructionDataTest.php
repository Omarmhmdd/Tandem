<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Data\RecipeInstructionData;

class RecipeInstructionDataTest extends TestCase
{
    public function test_prepare_creates_correct_structure(): void
    {
        $instruction = [
            'step_number' => 1,
            'instruction' => 'Preheat oven to 350°F',
        ];

        $result = RecipeInstructionData::prepare($instruction);

        $this->assertEquals(1, $result['step_number']);
        $this->assertEquals('Preheat oven to 350°F', $result['instruction']);
        $this->assertCount(2, $result);
    }

    public function test_prepare_many_processes_multiple_instructions(): void
    {
        $instructions = [
            ['step_number' => 1, 'instruction' => 'Mix ingredients'],
            ['step_number' => 2, 'instruction' => 'Bake for 30 minutes'],
            ['step_number' => 3, 'instruction' => 'Let cool'],
        ];

        $result = RecipeInstructionData::prepareMany($instructions);

        $this->assertCount(3, $result);
        $this->assertEquals(1, $result[0]['step_number']);
        $this->assertEquals(2, $result[1]['step_number']);
        $this->assertEquals(3, $result[2]['step_number']);
    }

    public function test_prepare_many_with_empty_array(): void
    {
        $result = RecipeInstructionData::prepareMany([]);

        $this->assertIsArray($result);
        $this->assertCount(0, $result);
    }

    public function test_prepare_handles_long_instruction(): void
    {
        $longText = str_repeat('This is a very long instruction. ', 10);
        $instruction = [
            'step_number' => 5,
            'instruction' => $longText,
        ];

        $result = RecipeInstructionData::prepare($instruction);

        $this->assertEquals($longText, $result['instruction']);
    }

    public function test_prepare_many_maintains_order(): void
    {
        $instructions = [
            ['step_number' => 3, 'instruction' => 'Third step'],
            ['step_number' => 1, 'instruction' => 'First step'],
            ['step_number' => 2, 'instruction' => 'Second step'],
        ];

        $result = RecipeInstructionData::prepareMany($instructions);

        // Should maintain input order, not sort
        $this->assertEquals(3, $result[0]['step_number']);
        $this->assertEquals(1, $result[1]['step_number']);
        $this->assertEquals(2, $result[2]['step_number']);
    }
}
