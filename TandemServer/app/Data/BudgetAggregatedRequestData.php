<?php

namespace App\Data;

use Illuminate\Http\Request;


class BudgetAggregatedRequestData
{
    public function __construct(
        public readonly ?string $startDate,
        public readonly ?string $endDate,
        public readonly ?int $year,
        public readonly ?int $month,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            startDate: $request->input('start_date'),
            endDate: $request->input('end_date'),
            year: $request->input('year') ? (int) $request->input('year') : null,
            month: $request->input('month') ? (int) $request->input('month') : null,
        );
    }

    public static function default(): self
    {
        return new self(
            startDate: null,
            endDate: null,
            year: now()->year,
            month: now()->month,
        );
    }
}

