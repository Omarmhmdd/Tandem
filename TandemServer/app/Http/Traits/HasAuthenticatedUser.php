<?php

namespace App\Http\Traits;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Auth\AuthenticationException;

trait HasAuthenticatedUser
{
    protected ?User $authenticatedUser = null;

    protected function getAuthenticatedUser(): User
    {
        if ($this->authenticatedUser === null) {
            $user = Auth::user();

            if (!$user) {
                throw new AuthenticationException('User not authenticated');
            }

            $this->authenticatedUser = $user;
        }

        return $this->authenticatedUser;
    }
}

