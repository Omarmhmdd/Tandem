<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateHouseholdRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'min:1'],
        ];
    }

    public function getHouseholdData(): array
    {
        return [
            'name' => $this->name,
        ];
    }
}

