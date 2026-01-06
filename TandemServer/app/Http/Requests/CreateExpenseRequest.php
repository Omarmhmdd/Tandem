<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Http\Traits\HasHouseholdMember;
use Illuminate\Support\Facades\Auth;

class CreateExpenseRequest extends FormRequest
{
    use HasHouseholdMember;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'description' => ['required', 'string', 'max:500'],
            'category' => ['nullable', 'in:groceries,dining,wedding,health,big-ticket,other'],
            'auto_tagged' => ['nullable', 'boolean'],
        ];
    }

    public function getExpenseData(): array
    {
        $user = Auth::user();
        $householdMember = $this->getHouseholdMember();

        return [
            'household_id' => $householdMember->household_id,
            'user_id' => $user->id,
            'date' => $this->date,
            'amount' => $this->amount,
            'description' => $this->description,
            'category' => $this->category ?? 'other',
            'auto_tagged' => $this->auto_tagged ?? false,
            'created_by_user_id' => $user->id,
            'updated_by_user_id' => $user->id,
        ];
    }
}

