<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateOrUpdateBudgetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'monthly_budget' => ['required', 'numeric', 'min:0.01'],
            'year' => ['nullable', 'integer', 'min:2000', 'max:2100'],
            'month' => ['nullable', 'integer', 'min:1', 'max:12'],
        ];
    }

    public function getBudgetData(): array
    {
        return [
            'monthly_budget' => $this->monthly_budget,
            'year' => $this->year,
            'month' => $this->month,
        ];
    }
}