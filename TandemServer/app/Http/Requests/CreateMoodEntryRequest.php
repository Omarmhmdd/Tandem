<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class CreateMoodEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => ['required', 'date', 'before_or_equal:today'],
            'time' => ['required'],
            'mood' => ['required', 'in:happy,calm,tired,anxious,sad,energized,neutral'],
            'notes' => ['nullable', 'string'],
        ];
    }

    public function getMoodEntryData(): array
    {
        $user = Auth::user();

        return [
            'user_id' => $user->id,
            'date' => $this->date,
            'time' => $this->time,
            'mood' => $this->mood,
            'notes' => $this->notes,
        ];
    }
}

