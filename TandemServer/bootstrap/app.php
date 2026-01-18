<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\CorsMiddleware;
use App\Http\Middleware\ForceJsonResponse;
use App\Http\Middleware\AuthenticateJwt;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Validation\ValidationException;
use App\Http\Middleware\RequireHousehold;
use App\Http\Middleware\RequirePrimaryRole;
use Illuminate\Http\Request;
use App\Http\Middleware\VerifyApiKey;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(prepend: [
            CorsMiddleware::class,
            ForceJsonResponse::class,
        ]);
        
        $middleware->alias([
            'jwt.auth' => AuthenticateJwt::class,
            'require.household' =>RequireHousehold::class,
            'require.primary' => RequirePrimaryRole::class,
            'api.key' => VerifyApiKey::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Helper function to add CORS headers
        $addCorsHeaders = function (Request $request, $response) {
            $origin = $request->headers->get('Origin');
            $allowedOrigins = [
                'http://localhost:3000',
                'http://localhost:5173',
                'http://127.0.0.1:3000',
                'http://127.0.0.1:5173',
                env('FRONTEND_URL', 'http://localhost:3000'),
            ];

            if (in_array($origin, $allowedOrigins)) {
                $response->headers->set('Access-Control-Allow-Origin', $origin);
            }

            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
            $response->headers->set('Access-Control-Max-Age', '86400');
            
            return $response;
        };
        
        $exceptions->render(function (AuthenticationException $e, Request $request) use ($addCorsHeaders) {
            if ($request->is('api/*')) {
                $response = response()->json([
                    'message' => $e->getMessage() ?: 'Unauthenticated',
                ], 401);
                return $addCorsHeaders($request, $response);
            }
        });
        
        $exceptions->render(function (ValidationException $e, Request $request) use ($addCorsHeaders) {
            if ($request->is('api/*')) {
                $response = response()->json([
                    'message' => 'Validation failed',
                    'errors' => $e->errors(),
                ], 422);
                return $addCorsHeaders($request, $response);
            }
        });
        
        $exceptions->render(function (\Throwable $e, Request $request) use ($addCorsHeaders) {
            if ($request->is('api/*')) {
                // Log the full error for debugging
                \Illuminate\Support\Facades\Log::error('API Error', [
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString(),
                    'url' => $request->fullUrl(),
                ]);
                
                $response = response()->json([
                    'message' => $e->getMessage() ?: 'Server Error',
                    'error' => config('app.debug') ? [
                        'file' => $e->getFile(),
                        'line' => $e->getLine(),
                        'trace' => $e->getTraceAsString(),
                    ] : null,
                ], 500);
                return $addCorsHeaders($request, $response);
            }
        });
    })->create();