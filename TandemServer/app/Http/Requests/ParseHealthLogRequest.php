<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ParseHealthLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'text' => ['required', 'string', 'min:1'],
            'mood' => ['nullable', 'in:happy,calm,tired,anxious,sad,energized,neutral'],
        ];
    }

    public function getText(): string
    {
        return $this->text;
    }

    public function getMood(): ?string
    {
        return $this->mood;
    }
}


