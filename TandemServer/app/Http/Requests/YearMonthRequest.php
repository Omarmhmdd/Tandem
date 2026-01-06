<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class YearMonthRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'year' => 'nullable|integer|min:2000|max:2100',
            'month' => 'nullable|integer|min:1|max:12',
        ];
    }

    public function getYear(): ?int
    {
        return $this->input('year') ? (int) $this->input('year') : null;
    }

    public function getMonth(): ?int
    {
        return $this->input('month') ? (int) $this->input('month') : null;
    }
}

