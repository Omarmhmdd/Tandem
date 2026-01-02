<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateHouseholdRequest extends FormRequest
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

    protected function prepareForValidation(): void
    {
        $name = $this->route('name');
        
        if ($name) {
            $name = urldecode($name);
        }
        
        $this->merge([
            'name' => $name,
        ]);
    }

    public function getName(): string
    {
        $name = $this->route('name');
        
        if (!$name) {
            throw new \InvalidArgumentException('Household name is required');
        }
        
        return urldecode($name);
    }

    public function getHouseholdData(): array
    {
        return [
            'name' => $this->getName(),
        ];
    }
}
