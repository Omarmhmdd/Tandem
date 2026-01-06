<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use App\Models\Goal;

class UpdateGoalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255', 'min:1'],
            'category' => ['sometimes', 'in:wedding,health,financial,other'],
            'target' => ['sometimes', 'numeric', 'min:0.01'],
            'current' => ['sometimes', 'numeric', 'min:0'],
            'unit' => ['sometimes', 'string', 'max:50'],
            'deadline' => ['nullable', 'date', 'after_or_equal:today'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if (!$this->has('current')) {
                return; // No current being updated, skip validation
            }

            $goalId = $this->route('id');
            $goal = Goal::find($goalId);
            
            if (!$goal) {
                return;
            }

            // Use new target if provided, otherwise use existing target
            $target = $this->has('target') ? (float) $this->target : (float) $goal->target;
            $current = (float) $this->current;

            if ($current > $target) {
                $unit = $this->has('unit') ? $this->unit : $goal->unit;
                $validator->errors()->add(
                    'current',
                    "Goal progress cannot exceed target ({$target} {$unit}). Maximum allowed: {$target}."
                );
            }
        });
    }

    public function getGoalData(): array
    {
        $data = [];

        $user = Auth::user();

        if ($this->has('title')) $data['title'] = $this->title;
        if ($this->has('category')) $data['category'] = $this->category;
        if ($this->has('target')) $data['target'] = $this->target;
        if ($this->has('current')) $data['current'] = $this->current;
        if ($this->has('unit')) $data['unit'] = $this->unit;
        if ($this->has('deadline')) $data['deadline'] = $this->deadline;

        $data['updated_by_user_id'] = $user->id;

        return $data;
    }
}