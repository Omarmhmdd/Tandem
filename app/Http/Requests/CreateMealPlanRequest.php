<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Http\Traits\HasHouseholdMember;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class CreateMealPlanRequest extends FormRequest
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

        return [
            'date' => ['required', 'date'],
            'meal_type' => ['required', 'in:breakfast,lunch,dinner,snack'],
            'recipe_id' => [
                'nullable',
                Rule::exists('recipes', 'id')->where(function ($query) use ($householdId) {
                    $query->where('household_id', $householdId)
                          ->whereNull('deleted_at'); // Exclude soft-deleted recipes
                }),
            ],
            'is_match_meal' => ['required', 'boolean'],
        ];
    }

    public function getMealPlanData(): array
    {
        $user = Auth::user();
        $householdMember = $this->getHouseholdMember();

        return [
            'household_id' => $householdMember->household_id,
            'date' => $this->date,
            'meal_type' => $this->meal_type,
            'recipe_id' => $this->recipe_id,
            'is_match_meal' => $this->is_match_meal,
            'created_by_user_id' => $user->id,
            'updated_by_user_id' => $user->id,
        ];
    }
}

