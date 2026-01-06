<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateRecipeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255', 'min:1'],
            'description' => ['nullable', 'string'],
            'prep_time' => ['sometimes', 'integer', 'min:0', 'max:1440'],
            'cook_time' => ['sometimes', 'integer', 'min:0', 'max:1440'],
            'servings' => ['sometimes', 'integer', 'min:1'],
            'difficulty' => ['sometimes', 'in:Easy,Medium,Hard'],
            'rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'ingredients' => ['sometimes', 'array', 'min:1'],
            'ingredients.*.ingredient_name' => ['required_with:ingredients', 'string', 'max:255'],
            'ingredients.*.quantity' => ['nullable', 'numeric', 'min:0'],
            'ingredients.*.unit' => ['nullable', 'string', 'max:50'],
            'instructions' => ['sometimes', 'array', 'min:1'],
            'instructions.*.step_number' => ['required_with:instructions', 'integer', 'min:1'],
            'instructions.*.instruction' => ['required_with:instructions', 'string'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
        ];
    }

    public function getRecipeData(): array
    {
        $data = [];
        $user = Auth::user();

        if ($this->has('name')) $data['name'] = $this->name;
        if ($this->has('description')) $data['description'] = $this->description;
        if ($this->has('prep_time')) $data['prep_time'] = $this->prep_time;
        if ($this->has('cook_time')) $data['cook_time'] = $this->cook_time;
        if ($this->has('servings')) $data['servings'] = $this->servings;
        if ($this->has('difficulty')) $data['difficulty'] = $this->difficulty;
        if ($this->has('rating')) $data['rating'] = $this->rating;

        $data['updated_by_user_id'] = $user->id;

        return $data;
    }

    public function getIngredientsData(): ?array
    {
        return $this->has('ingredients') ? $this->ingredients : null;
    }

    public function getInstructionsData(): ?array
    {
        return $this->has('instructions') ? $this->instructions : null;
    }

    public function getTagsData(): ?array
    {
        return $this->has('tags') ? $this->tags : null;
    }
}

