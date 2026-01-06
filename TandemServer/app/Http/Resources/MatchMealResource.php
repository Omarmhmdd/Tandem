<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MatchMealResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'meal_plan_id' => $this->meal_plan_id,
            'invited_by_user_id' => $this->invited_by_user_id,
            'invited_to_user_id' => $this->invited_to_user_id,
            'status' => $this->status,
            'invite_sent_at' => $this->invite_sent_at?->format('Y-m-d H:i:s'),
            'responded_at' => $this->responded_at?->format('Y-m-d H:i:s'),
        ];
    }
}

