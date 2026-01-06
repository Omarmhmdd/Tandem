<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GenerateWeeklySummaryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'week_start' => 'nullable|date',
        ];
    }

    public function getWeekStart(): ?string
    {
        return $this->input('week_start');
    }
}

