<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateHabitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255', 'min:1'],
            'description' => ['nullable', 'string'],
            'frequency' => ['sometimes', 'in:daily,weekly,custom'],
            'reminder_time' => ['nullable', 'date_format:H:i'],
        ];
    }

    public function getHabitData(): array
    {
        $data = [];
        $user = Auth::user();

        if ($this->has('name')) $data['name'] = $this->name;
        if ($this->has('description')) $data['description'] = $this->description;
        if ($this->has('frequency')) $data['frequency'] = $this->frequency;
        if ($this->has('reminder_time')) {
            $data['reminder_time'] = $this->reminder_time ? now()->setTimeFromTimeString($this->reminder_time) : null;
        }

        $data['updated_by_user_id'] = $user->id;

        return $data;
    }
}

