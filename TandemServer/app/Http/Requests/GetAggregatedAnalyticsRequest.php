<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GetAggregatedAnalyticsRequest extends FormRequest
{

    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }


    public function rules(): array
    {
        return [
            'time_range' => ['sometimes', 'string', 'in:week,month'],
            'week_start' => ['sometimes', 'nullable', 'date'],
            'week_end' => ['sometimes', 'nullable', 'date'],
            'month_start' => ['sometimes', 'nullable', 'date'],
            'year' => ['sometimes', 'nullable', 'integer', 'min:2000', 'max:2100'],
            'month' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:12'],
        ];
    }


    public function toDataArray(): array
    {
        return [
            'time_range' => $this->input('time_range', 'week'),
            'week_start' => $this->input('week_start'),
            'week_end' => $this->input('week_end'),
            'month_start' => $this->input('month_start'),
            'year' => $this->input('year'),
            'month' => $this->input('month'),
        ];
    }
}

