<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;
use App\Models\HouseholdMember;

class RequirePrimaryRole
{
    protected $user;

    protected function getActiveHouseholdMember()
    {
        if (!$this->user) {
            return null;
        }

        return HouseholdMember::where('user_id', $this->user->id)
            ->where('status', 'active')
            ->first();
    }

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

        if ($householdMember->role !== 'primary') {
            return response()->json([
                'message' => 'Only the primary household member can perform this action',
                'requires_primary_role' => true,
            ], 403);
        }

        return $next($request);
    }
}