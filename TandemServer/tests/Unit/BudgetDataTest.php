<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Data\BudgetData;

class BudgetDataTest extends TestCase
{
    public function test_prepare_uses_provided_year_and_month(): void
    {
        $input = [
            'year' => 2025,
            'month' => 6,
            'monthly_budget' => 2000,
        ];

        $result = BudgetData::prepare($input);

        $this->assertEquals(2025, $result['year']);
        $this->assertEquals(6, $result['month']);
        $this->assertEquals(2000.0, $result['monthly_budget']);
    }

    public function test_prepare_converts_monthly_budget_to_float(): void
    {
        $input = [
            'monthly_budget' => '1500',
        ];

        $result = BudgetData::prepare($input);

        $this->assertIsFloat($result['monthly_budget']);
        $this->assertEquals(1500.0, $result['monthly_budget']);
    }

    public function test_get_search_criteria_returns_correct_structure(): void
    {
        $preparedData = [
            'year' => 2026,
            'month' => 3,
            'monthly_budget' => 3000,
        ];

        $result = BudgetData::getSearchCriteria(123, $preparedData);

        $this->assertEquals(123, $result['household_id']);
        $this->assertEquals(2026, $result['year']);
        $this->assertEquals(3, $result['month']);
        $this->assertCount(3, $result);
    }

    public function test_get_update_data_with_null_budget(): void
    {
        $preparedData = ['monthly_budget' => 1800];

        $result = BudgetData::getUpdateData(null, $preparedData, 300);

        $this->assertEquals(1800, $result['monthly_budget']);
        $this->assertEquals(300, $result['created_by_user_id']);
        $this->assertEquals(300, $result['updated_by_user_id']);
    }
}
