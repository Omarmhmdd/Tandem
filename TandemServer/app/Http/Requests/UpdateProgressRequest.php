<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Goal;
class UpdateProgressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'current' => ['required', 'numeric', 'min:0'],
        ];
    }
     public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $goalId = $this->route('id');
            $goal = Goal::find($goalId);
            
            if ($goal && $this->current > $goal->target) {
                $validator->errors()->add(
                    'current',
                    "Goal progress cannot exceed target ({$goal->target} {$goal->unit}). Maximum allowed: {$goal->target}."
                );
            }
        });
    }



    public function getCurrent(): float
    {
        return (float) $this->current;
    }
}


