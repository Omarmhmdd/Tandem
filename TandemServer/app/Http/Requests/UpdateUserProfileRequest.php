<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UpdateUserProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $user = Auth::user();
        
        return [
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'first_name' => ['sometimes', 'required', 'string', 'max:100', 'min:1'],
            'last_name' => ['sometimes', 'required', 'string', 'max:100', 'min:1'],
        ];
    }

    public function getUserData(): array
    {
        $data = [];
        
        if ($this->has('email')) {
            $data['email'] = $this->email;
        }
        
        if ($this->has('first_name')) {
            $data['first_name'] = $this->first_name;
        }
        
        if ($this->has('last_name')) {
            $data['last_name'] = $this->last_name;
        }
        
        return $data;
    }
}

