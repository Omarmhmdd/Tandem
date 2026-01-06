<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateMilestoneRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255', 'min:1'],
            'completed' => ['nullable', 'boolean'],
            'deadline' => ['nullable', 'date'],
            'order' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function getMilestoneData(int $goalId): array
    {
        return [
            'goal_id' => $goalId,
            'title' => $this->title,
            'completed' => $this->input('completed', false),
            'deadline' => $this->deadline,
            'order' => $this->input('order', 0),
        ];
    }
}