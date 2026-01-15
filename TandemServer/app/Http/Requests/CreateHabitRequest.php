<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class CreateHabitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'min:1'],
            'description' => ['nullable', 'string'],
            'frequency' => ['required', 'in:daily,weekly,custom'],
            'reminder_time' => ['nullable', 'date_format:H:i'],
            'timezone' => ['nullable', 'string', 'max:50'],
        ];
    }

    public function getHabitData(): array
    {
        $user = Auth::user();

        // Update user timezone if provided and reminder_time is set
        if ($this->reminder_time && $this->timezone) {
            $user->timezone = $this->timezone;
            $user->save();
        }

        return [
            'user_id' => $user->id,
            'name' => $this->name,
            'description' => $this->description,
            'frequency' => $this->frequency,
            'reminder_time' => $this->reminder_time ? now()->setTimeFromTimeString($this->reminder_time) : null,
            'created_by_user_id' => $user->id,
            'updated_by_user_id' => $user->id,
        ];
    }
}

