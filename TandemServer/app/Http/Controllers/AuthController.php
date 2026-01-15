<?php

namespace App\Http\Controllers;

use App\Services\AuthService;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\UpdateUserProfileRequest;
use App\Http\Resources\UserResource;
use App\Http\Resources\HouseholdResource;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
    private const TOKEN_TYPE = 'bearer';

    public function __construct(
        protected AuthService $authService
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->register($request->getUserData());

        return $this->authResponse($result, 'User registered successfully', 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login($request->validated());

        return $this->authResponse($result, 'Login successful');
    }

    public function logout(): JsonResponse
    {
        $this->authService->logout();

        return $this->success(null, 'Successfully logged out');
    }

    public function me(): JsonResponse
    {
        $result = $this->authService->me();

        return $this->success([
            'user' => new UserResource($result['user']),
            'household' => $result['household'] ? new HouseholdResource($result['household']) : null,
            'has_household' => $result['has_household'],
        ]);
    }

    public function updateProfile(UpdateUserProfileRequest $request): JsonResponse
    {
        $user = $this->authService->updateProfile($request->getUserData());

        return $this->success([
            'user' => new UserResource($user),
        ], 'Profile updated successfully');
    }


    private function authResponse(array $result, string $message, int $statusCode = 200): JsonResponse
    {
        $data = [
            'user' => new UserResource($result['user']),
            'access_token' => $result['token'],
            'token_type' => $result['token_type'] ?? self::TOKEN_TYPE,
        ];

        return $statusCode === 201 
            ? $this->created($data, $message)
            : $this->success($data, $message);
    }
}