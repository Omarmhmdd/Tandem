<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class JoinHouseholdRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'size:8'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'code' => $this->route('code'),
        ]);
    }

    public function getCode(): string
    {
        return $this->route('code');
    }
}
