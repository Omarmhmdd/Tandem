<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNutritionTargetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'calories' => 'nullable|integer|min:1',
            'protein' => 'nullable|integer|min:0',
            'carbs' => 'nullable|integer|min:0',
            'fat' => 'nullable|integer|min:0',
        ];
    }

    public function getTargetData(): array
    {
      return array_filter(
        $this->only(['calories', 'protein', 'carbs', 'fat']),
        fn($value) => $value !== null
    );
}
}

