<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Http\Traits\HasHouseholdMember;
use Illuminate\Support\Facades\Auth;

class CreatePantryItemRequest extends FormRequest
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
            'quantity' => ['required', 'numeric', 'min:0.01'],
            'unit' => ['required', 'string', 'max:50'],
            'expiry_date' => ['nullable', 'date'],
            'location' => ['required', 'in:Fridge,Freezer,Pantry,Counter,Other'],
            'category' => ['required', 'in:Meat,Dairy,Vegetables,Grains,Fruits,Other'],
        ];
    }

    public function getPantryItemData(): array
    {
        $user = Auth::user();
        $householdMember = $this->getHouseholdMember();

        return [
            'household_id' => $householdMember->household_id,
            'name' => $this->name,
            'quantity' => $this->quantity,
            'unit' => $this->unit,
            'expiry_date' => $this->expiry_date,
            'location' => $this->location,
            'category' => $this->category,
            'created_by_user_id' => $user->id,
            'updated_by_user_id' => $user->id,
        ];
    }
}

