<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => ['sometimes', 'date'],
            'amount' => ['sometimes', 'numeric', 'min:0.01'],
            'description' => ['sometimes', 'string', 'max:500'],
            'category' => ['sometimes', 'in:groceries,dining,wedding,health,big-ticket,other'],
            'auto_tagged' => ['sometimes', 'boolean'],
        ];
    }

    public function getExpenseData(): array
    {
        $data = [];
        $user = Auth::user();

        if ($this->has('date')) $data['date'] = $this->date;
        if ($this->has('amount')) $data['amount'] = $this->amount;
        if ($this->has('description')) $data['description'] = $this->description;
        if ($this->has('category')) $data['category'] = $this->category;
        if ($this->has('auto_tagged')) $data['auto_tagged'] = $this->auto_tagged;

        $data['updated_by_user_id'] = $user->id;

        return $data;
    }
}

