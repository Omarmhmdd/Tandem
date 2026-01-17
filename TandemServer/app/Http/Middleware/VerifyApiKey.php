<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyApiKey
{
    
    public function handle(Request $request, Closure $next): Response
    {
        $apiKey = $request->header('X-API-Key') ?? $request->query('api_key');
        $validKey = env('N8N_API_KEY');

        if (!$validKey) {
            return response()->json(['message' => 'API key not configured'], 500);
        }

        if (!$apiKey || $apiKey !== $validKey) {
            return response()->json(['message' => 'Unauthorized - Invalid API key'], 401);
        }

        return $next($request);
    }
}

