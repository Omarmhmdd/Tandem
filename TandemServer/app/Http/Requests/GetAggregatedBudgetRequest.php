<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GetAggregatedBudgetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    public function rules(): array
    {
        return [
            'start_date' => ['sometimes', 'nullable', 'date'],
            'end_date' => ['sometimes', 'nullable', 'date', 'after_or_equal:start_date'],
            'year' => ['sometimes', 'nullable', 'integer', 'min:2000', 'max:2100'],
            'month' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:12'],
        ];
    }
}

