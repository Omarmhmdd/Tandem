<?php

namespace App\Data;

/**
 * Data class for aggregated analytics request parameters
 */
class AnalyticsAggregatedRequestData
{
    public function __construct(
        public readonly string $timeRange,
        public readonly ?string $weekStart,
        public readonly ?string $weekEnd,
        public readonly ?string $monthStart,
        public readonly int $currentYear,
        public readonly int $currentMonth,
    ) {}


    public static function fromArray(array $data): self
    {
        return new self(
            timeRange: $data['timeRange'] ?? $data['time_range'] ?? 'week',
            weekStart: $data['weekStart'] ?? $data['week_start'] ?? null,
            weekEnd: $data['weekEnd'] ?? $data['week_end'] ?? null,
            monthStart: $data['monthStart'] ?? $data['month_start'] ?? null,
            currentYear: isset($data['currentYear']) ? (int) $data['currentYear'] : (isset($data['year']) ? (int) $data['year'] : now()->year),
            currentMonth: isset($data['currentMonth']) ? (int) $data['currentMonth'] : (isset($data['month']) ? (int) $data['month'] : now()->month),
        );
    }


    public function getAnalyticsStartDate(): ?string
    {
        return $this->timeRange === 'week' ? $this->weekStart : $this->monthStart;
    }

 
    public function getAnalyticsEndDate(): string
    {
        return $this->timeRange === 'week' ? ($this->weekEnd ?? now()->format('Y-m-d')) : now()->format('Y-m-d');
    }
}

