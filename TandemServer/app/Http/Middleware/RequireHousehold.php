<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;
use App\Http\Traits\HasActiveHouseholdMember;

class RequireHousehold
{
    use HasActiveHouseholdMember;

    protected $user;

    public function handle(Request $request, Closure $next): Response
    {
        $this->user = Auth::user();

        if (!$this->user) {
            return response()->json([
                'message' => 'Unauthenticated',
            ], 401);
        }

        $householdMember = $this->getActiveHouseholdMember();

        if (!$householdMember) {
            return response()->json([
                'message' => 'You must create or join a household to access this feature',
                'requires_household' => true,
            ], 403);
        }

        return $next($request);
    }
}