<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Http\Traits\HasHouseholdMember;
use Illuminate\Validation\Rule;

class LinkPantryRequest extends FormRequest
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
            'links' => ['required', 'array', 'min:1'],
            'links.*.recipe_ingredient_id' => [
                'required',
                Rule::exists('recipe_ingredients', 'id')->where(function ($query) use ($householdId) {
                    $query->whereIn('recipe_id', function ($subQuery) use ($householdId) {
                        $subQuery->select('id')
                            ->from('recipes')
                            ->where('household_id', $householdId)
                            ->whereNull('deleted_at');
                    });
                }),
            ],
            'links.*.pantry_item_id' => [
                'required',
                Rule::exists('pantry_items', 'id')->where(function ($query) use ($householdId) {
                    $query->where('household_id', $householdId)
                            ->whereNull('deleted_at');
                }),
            ],
            'links.*.quantity_used' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    public function getLinksData(): array
    {
        return $this->links ?? [];
    }
}

