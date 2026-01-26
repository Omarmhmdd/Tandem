<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Data\BudgetSummaryData;

class BudgetSummaryDataTest extends TestCase
{
    public function test_empty_returns_correct_structure(): void
    {
        $result = BudgetSummaryData::empty();

        $this->assertIsArray($result);
        $this->assertArrayHasKey('budget', $result);
        $this->assertArrayHasKey('total_expenses', $result);
        $this->assertArrayHasKey('remaining', $result);
        
        $this->assertNull($result['budget']);
        $this->assertEquals(0, $result['total_expenses']);
        $this->assertNull($result['remaining']);
    }

    public function test_to_array_with_null_budget(): void
    {
        $result = BudgetSummaryData::toArray(null, 250.75);

        $this->assertNull($result['budget']);
        $this->assertEquals(250.75, $result['total_expenses']);
        $this->assertNull($result['remaining']);
    }

    public function test_to_array_with_zero_expenses(): void
    {
        $result = BudgetSummaryData::toArray(null, 0);

        $this->assertEquals(0, $result['total_expenses']);
        $this->assertNull($result['remaining']);
    }
}
