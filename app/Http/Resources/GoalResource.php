<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GoalResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'household_id' => $this->household_id,
            'user_id' => $this->user_id,
            'title' => $this->title,
            'category' => $this->category,
            'target' => (float) $this->target,
            'current' => (float) $this->current,
            'progress_percentage' => $this->progress_percentage ? (float) $this->progress_percentage : null,
            'unit' => $this->unit,
            'deadline' => $this->deadline?->format('Y-m-d'),
            'completed_at' => $this->completed_at?->format('Y-m-d H:i:s'),
            'milestones' => GoalMilestoneResource::collection($this->whenLoaded('milestones')),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}


