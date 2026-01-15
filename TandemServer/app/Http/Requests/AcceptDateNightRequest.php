<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AcceptDateNightRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => 'required|date|after_or_equal:today',
        ];
    }

    public function getDate(): string
    {
        return $this->input('date');
    }
}

