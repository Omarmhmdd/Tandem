<?php

namespace App\Services;

use App\Models\User;
use App\Models\HouseholdMember;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Illuminate\Auth\AuthenticationException;

class AuthService
{
    private const TOKEN_TYPE = 'bearer';
    private const ACTIVE_STATUS = 'active';

    public function register(array $userData): array
    {
        $user = User::create($userData);

        return $this->buildAuthResponse($user);
    }

    public function login(array $credentials): array
    {
        $user = User::where('email', $credentials['email'])->first();

        if (!$user || $user->trashed()) {
            throw new AuthenticationException('Invalid credentials');
        }

        if (!Hash::check($credentials['password'], $user->password_hash)) {
            throw new AuthenticationException('Invalid credentials');
        }

        return $this->buildAuthResponse($user);
    }

    public function logout(): void
    {
        try {
            $token = JWTAuth::getToken();
            if ($token) {
                JWTAuth::invalidate($token);
            }
        } catch (JWTException $e) {
        
        }
    }

    public function me(): array
    {
        $user = Auth::user();

        if (!$user) {
            throw new AuthenticationException('User not authenticated');
        }

        $householdMember = HouseholdMember::where('user_id', $user->id)
            ->where('status', self::ACTIVE_STATUS)
            ->with('household')
            ->first();

        return [
            'user' => $user,
            'household' => $householdMember?->household,
            'has_household' => $householdMember !== null,
        ];
    }

    private function buildAuthResponse(User $user): array
    {
        return [
            'user' => $user,
            'token' => JWTAuth::fromUser($user),
            'token_type' => self::TOKEN_TYPE,
        ];
    }
}