<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProgressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'current' => ['required', 'numeric', 'min:0'],
        ];
    }

    public function getCurrent(): float
    {
        return (float) $this->current;
    }
}


