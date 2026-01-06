<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Http\Traits\HasHouseholdMember;
use Illuminate\Support\Facades\Auth;

class CreateRecipeRequest extends FormRequest
{
    use HasHouseholdMember;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'min:1'],
            'description' => ['nullable', 'string'],
            'prep_time' => ['required', 'integer', 'min:0', 'max:1440'],
            'cook_time' => ['required', 'integer', 'min:0', 'max:1440'],
            'servings' => ['required', 'integer', 'min:1'],
            'difficulty' => ['required', 'in:Easy,Medium,Hard'],
            'rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'ingredients' => ['required', 'array', 'min:1'],
            'ingredients.*.ingredient_name' => ['required', 'string', 'max:255'],
            'ingredients.*.quantity' => ['nullable', 'numeric', 'min:0'],
            'ingredients.*.unit' => ['nullable', 'string', 'max:50'],
            'instructions' => ['required', 'array', 'min:1'],
            'instructions.*.step_number' => ['required', 'integer', 'min:1'],
            'instructions.*.instruction' => ['required', 'string'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
        ];
    }

    public function getRecipeData(): array
    {
        $user = Auth::user();
        $householdMember = $this->getHouseholdMember();

        return [
            'household_id' => $householdMember->household_id,
            'name' => $this->name,
            'description' => $this->description,
            'prep_time' => $this->prep_time,
            'cook_time' => $this->cook_time,
            'servings' => $this->servings,
            'difficulty' => $this->difficulty,
            'rating' => $this->rating,
            'created_by_user_id' => $user->id,
            'updated_by_user_id' => $user->id,
        ];
    }

    public function getIngredientsData(): array
    {
        return $this->ingredients ?? [];
    }

    public function getInstructionsData(): array
    {
        return $this->instructions ?? [];
    }

    public function getTagsData(): array
    {
        return $this->tags ?? [];
    }
}

