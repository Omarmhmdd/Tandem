<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransferOwnershipRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'new_primary_user_id' => ['required', 'integer', 'exists:users,id'],
        ];
    }

    public function getNewPrimaryUserId(): int
    {
        return (int) $this->input('new_primary_user_id');
    }
}

