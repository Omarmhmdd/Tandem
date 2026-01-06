<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdatePantryItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255', 'min:1'],
            'quantity' => ['sometimes', 'numeric', 'min:0.01'],
            'unit' => ['sometimes', 'string', 'max:50'],
            'expiry_date' => ['nullable', 'date'],
            'location' => ['sometimes', 'in:Fridge,Freezer,Pantry,Counter,Other'],
            'category' => ['sometimes', 'in:Meat,Dairy,Vegetables,Grains,Fruits,Other'],
        ];
    }

    public function getPantryItemData(): array
    {
        $data = [];
        $user = Auth::user();

        if ($this->has('name')) $data['name'] = $this->name;
        if ($this->has('quantity')) $data['quantity'] = $this->quantity;
        if ($this->has('unit')) $data['unit'] = $this->unit;
        if ($this->has('expiry_date')) $data['expiry_date'] = $this->expiry_date;
        if ($this->has('location')) $data['location'] = $this->location;
        if ($this->has('category')) $data['category'] = $this->category;

        $data['updated_by_user_id'] = $user->id;

        return $data;
    }
}

