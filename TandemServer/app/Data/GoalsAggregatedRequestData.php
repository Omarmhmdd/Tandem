<?php

namespace App\Data;

use Illuminate\Http\Request;


class GoalsAggregatedRequestData
{
    public function __construct(
        public readonly ?int $year,
        public readonly ?int $month,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            year: $request->input('year') ? (int) $request->input('year') : null,
            month: $request->input('month') ? (int) $request->input('month') : null,
        );
    }

    public static function default(): self
    {
        return new self(
            year: now()->year,
            month: now()->month,
        );
    }
}

