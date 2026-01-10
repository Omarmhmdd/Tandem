<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use config\PromptSanitizer;

class AiCoachQueryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'question' => ['required', 'string', 'min:1', 'max:1000'],
        ];
    }

    public function getQuestion(): string
    {
        return PromptSanitizer::sanitizeForPrompt($this->question);
    }
}