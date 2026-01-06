<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CompleteHabitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => ['required', 'date'],
            'completed' => ['required', 'boolean'],
            'notes' => ['nullable', 'string'],
        ];
    }

    public function getCompletionData(): array
    {
        return [
            'date' => $this->date,
            'completed' => $this->completed,
            'notes' => $this->notes,
        ];
    }
}


