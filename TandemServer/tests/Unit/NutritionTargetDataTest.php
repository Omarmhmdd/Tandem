<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Data\NutritionTargetData;

class NutritionTargetDataTest extends TestCase
{
    public function test_to_array_returns_null_for_null_target(): void
    {
        $result = NutritionTargetData::toArray(null);

        $this->assertNull($result);
    }
}
