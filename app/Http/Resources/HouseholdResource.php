<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HouseholdResource extends JsonResource
{
    public function toArray(Request $request): array
    {
    
        $primaryUserId = null;
        

        if ($this->relationLoaded('primaryMember') && $this->primaryMember) {
            $primaryUserId = $this->primaryMember->user_id;
        } 
    
        elseif ($this->relationLoaded('members')) {
            $primaryMember = $this->members->firstWhere('role', 'primary');
            $primaryUserId = $primaryMember?->user_id;
        } 
        
        else {
            try {
                $primaryMember = $this->primaryMember;
                $primaryUserId = $primaryMember?->user_id;
            } catch (\Exception $e) {
                $primaryMember = $this->members()->where('role', 'primary')->first();
                $primaryUserId = $primaryMember?->user_id;
            }
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'primary_user_id' => $primaryUserId,
            'members' => $this->when(
                $this->relationLoaded('members'),
                fn() => $this->members->map(function ($member) {
                    return [
                        'id' => $member->id,
                        'user_id' => $member->user_id,
                        'role' => $member->role,
                        'email' => $member->user->email ?? null,
                        'first_name' => $member->user->first_name ?? null,
                    ];
                })
            ),
        ];
    }
}
