<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Http\Traits\HasHouseholdMember;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UpdateMealPlanRequest extends FormRequest
{
    use HasHouseholdMember;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $householdMember = $this->getHouseholdMemberOrNull();
        $householdId = $householdMember?->household_id;

        return [
            'date' => ['sometimes', 'date'],
            'meal_type' => ['sometimes', 'in:breakfast,lunch,dinner,snack'],
            'recipe_id' => [
                'nullable',
                Rule::exists('recipes', 'id')->where(function ($query) use ($householdId) {
                    if ($householdId) {
                        $query->where('household_id', $householdId);
                    }
                    $query->whereNull('deleted_at'); // Exclude soft-deleted recipes
                }),
            ],
            'is_match_meal' => ['sometimes', 'boolean'],
        ];
    }

    public function getMealPlanData(): array
    {
        $data = [];
        $user = Auth::user();

        if ($this->has('date')) $data['date'] = $this->date;
        if ($this->has('meal_type')) $data['meal_type'] = $this->meal_type;
        if ($this->has('recipe_id')) $data['recipe_id'] = $this->recipe_id;
        if ($this->has('is_match_meal')) $data['is_match_meal'] = $this->is_match_meal;

        $data['updated_by_user_id'] = $user->id;

        return $data;
    }
}

