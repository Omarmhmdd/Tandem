<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SendAutoOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'partner_id' => ['required', 'string', 'max:255'],
            'shopping_list' => ['required', 'array', 'min:1'],
            'shopping_list.*.name' => ['required', 'string', 'max:255'],
            'shopping_list.*.quantity' => ['nullable', 'string'],
            'shopping_list.*.needed' => ['nullable', 'boolean'],
        ];
    }

    public function getPartnerId(): string
    {
        return $this->input('partner_id') ?? $this->input('partnerId');
    }

    public function getShoppingListItems(): array
    {
        return $this->shopping_list ?? [];
    }
}