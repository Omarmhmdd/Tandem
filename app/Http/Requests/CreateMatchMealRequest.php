<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Http\Traits\HasHouseholdMember;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class CreateMatchMealRequest extends FormRequest
{
    use HasHouseholdMember;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $householdMember = $this->getHouseholdMember();
        $householdId = $householdMember->household_id;
        $userId = Auth::id();

        return [
            'meal_plan_id' => [
                'required',
                Rule::exists('meal_plans', 'id')->where(function ($query) use ($householdId) {
                    $query->where('household_id', $householdId)
                            ->whereNull('deleted_at');
                }),
            ],
            'invited_to_user_id' => [
                'required',
                Rule::exists('users', 'id'),
                'different:' . $userId,
                Rule::exists('household_members', 'user_id')->where(function ($query) use ($householdId) {
                    $query->where('household_id', $householdId)
                            ->where('status', 'active');
                }),
            ],
        ];
    }

    public function getMatchMealData(): array
    {
        return [
            'meal_plan_id' => $this->meal_plan_id,
            'invited_by_user_id' => Auth::id(),
            'invited_to_user_id' => $this->invited_to_user_id,
            'status' => 'pending',
            'invite_sent_at' => now(),
        ];
    }
}

