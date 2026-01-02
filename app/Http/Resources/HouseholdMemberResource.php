<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HouseholdMemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'household_id' => $this->household_id,
            'user_id' => $this->user_id,
            'role' => $this->role,
            'status' => $this->status,
            'joined_at' => $this->joined_at?->toDateTimeString(),
            'user' => $this->whenLoaded('user', fn() => new UserResource($this->user)),
            'household' => $this->whenLoaded('household', fn() => new HouseholdResource($this->household)),
        ];
    }
}
