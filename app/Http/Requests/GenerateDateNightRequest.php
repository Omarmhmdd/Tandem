<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GenerateDateNightRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'suggested_at' => 'nullable|date|after_or_equal:today',
            'budget' => 'nullable|numeric|min:0|max:10000',
        ];
    }

    public function getSuggestedAt(): ?string
    {
        return $this->input('suggested_at');
    }

    public function getBudget(): ?float
    {
        return $this->input('budget') ? (float) $this->input('budget') : null;
    }
}

