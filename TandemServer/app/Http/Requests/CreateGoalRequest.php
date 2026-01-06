<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Http\Traits\HasHouseholdMember;
use Illuminate\Support\Facades\Auth;

class CreateGoalRequest extends FormRequest
{
    use HasHouseholdMember;
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255', 'min:1'],
            'category' => ['required', 'in:wedding,health,financial,other'],
            'target' => ['required', 'numeric', 'min:0.01'],
            'current' => ['required', 'numeric', 'min:0'],
            'unit' => ['required', 'string', 'max:50'],
            'deadline' => ['nullable', 'date', 'after_or_equal:today'],
            'is_household' => ['required', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->is_household) {
            $householdMember = $this->getHouseholdMemberOrNull();
            if (!$householdMember) {
                $this->merge(['is_household' => false]);
            }
        }
    }

    public function getGoalData(): array
    {
        $user = Auth::user();

        $data = [
            'title' => $this->title,
            'category' => $this->category,
            'target' => $this->target,
            'current' => $this->current,
            'unit' => $this->unit,
            'deadline' => $this->deadline,
            'created_by_user_id' => $user->id,
            'updated_by_user_id' => $user->id,
        ];

        if ($this->is_household) {
            $householdMember = $this->getHouseholdMember();
            $data['household_id'] = $householdMember->household_id;
        } else {
            $data['user_id'] = $user->id;
        }

        return $data;
    }
}

