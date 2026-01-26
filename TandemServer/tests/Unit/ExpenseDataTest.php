<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Data\ExpenseData;

class ExpenseDataTest extends TestCase
{
    public function test_prepare_sets_default_category_when_missing(): void
    {
        $input = [
            'amount' => 100,
            'description' => 'Test expense',
        ];

        $result = ExpenseData::prepare($input);

        $this->assertEquals('other', $result['category']);
        $this->assertEquals(100, $result['amount']);
        $this->assertEquals('Test expense', $result['description']);
    }

    public function test_prepare_sets_default_category_when_empty(): void
    {
        $input = [
            'amount' => 50,
            'category' => '',
        ];

        $result = ExpenseData::prepare($input);

        $this->assertEquals('other', $result['category']);
    }

    public function test_prepare_keeps_existing_category(): void
    {
        $input = [
            'amount' => 200,
            'category' => 'food',
        ];

        $result = ExpenseData::prepare($input);

        $this->assertEquals('food', $result['category']);
    }

    public function test_prepare_sets_auto_tagged_to_false_by_default(): void
    {
        $input = [
            'amount' => 75,
            'category' => 'transport',
        ];

        $result = ExpenseData::prepare($input);

        $this->assertFalse($result['auto_tagged']);
    }

    public function test_prepare_keeps_auto_tagged_when_provided(): void
    {
        $input = [
            'amount' => 150,
            'category' => 'groceries',
            'auto_tagged' => true,
        ];

        $result = ExpenseData::prepare($input);

        $this->assertTrue($result['auto_tagged']);
    }
}
