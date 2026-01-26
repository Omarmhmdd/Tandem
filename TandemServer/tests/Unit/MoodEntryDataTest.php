<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Data\MoodEntryData;

class MoodEntryDataTest extends TestCase
{
    public function test_get_search_criteria_returns_user_id_and_date(): void
    {
        $input = [
            'user_id' => 42,
            'date' => '2026-01-24',
            'mood' => 'happy',
        ];

        $result = MoodEntryData::getSearchCriteria($input);

        $this->assertEquals(42, $result['user_id']);
        $this->assertEquals('2026-01-24', $result['date']);
        $this->assertCount(2, $result);
    }

    public function test_get_update_data_with_all_fields(): void
    {
        $input = [
            'mood' => 'excited',
            'time' => '14:30:00',
            'notes' => 'Great day!',
        ];

        $result = MoodEntryData::getUpdateData($input);

        $this->assertEquals('excited', $result['mood']);
        $this->assertEquals('14:30:00', $result['time']);
        $this->assertEquals('Great day!', $result['notes']);
    }

    public function test_get_update_data_with_missing_notes(): void
    {
        $input = [
            'mood' => 'calm',
            'time' => '09:15:00',
        ];

        $result = MoodEntryData::getUpdateData($input);

        $this->assertEquals('calm', $result['mood']);
        $this->assertNull($result['notes']);
    }

    public function test_get_update_data_sets_null_for_empty_notes(): void
    {
        $input = [
            'mood' => 'neutral',
        ];

        $result = MoodEntryData::getUpdateData($input);

        $this->assertNull($result['notes']);
        $this->assertArrayHasKey('time', $result);
    }
}
