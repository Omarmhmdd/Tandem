<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use App\Validators\HealthLogParsedDataValidator;
class CreateHealthLogRequest extends FormRequest
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
            'activities' => ['nullable', 'array'],
            'food' => ['nullable', 'array'],
            'sleep_hours' => ['nullable', 'numeric', 'min:0', 'max:24'],
            'bedtime' => ['nullable'],
            'wake_time' => ['nullable'],
            'mood' => ['nullable', 'in:happy,calm,tired,anxious,sad,energized,neutral'],
            'notes' => ['nullable', 'string'],
            'original_text' => ['nullable', 'string'],
            'confidence' => ['nullable', 'numeric', 'min:0', 'max:1'],
        ];
    }

    public function getHealthLogData(): array
    {
        $user = Auth::user();
        $notes = $this->notes ? HealthLogParsedDataValidator::filterGibberish($this->notes) : null;

        return [
            'user_id' => $user->id,
            'date' => $this->date,
            'time' => $this->time,
            'activities' => $this->activities ?? [],
            'food' => $this->food ?? [],
            'sleep_hours' => $this->sleep_hours,
            'bedtime' => $this->bedtime,
            'wake_time' => $this->wake_time,
            'mood' => $this->mood ?? 'neutral',
            'notes' => $notes,
            'original_text' => $this->original_text, 
            'confidence' => $this->confidence ?? 0.5,
            'created_by_user_id' => $user->id,
            'updated_by_user_id' => $user->id,
        ];
    }
}

