<?php

namespace App\Services;

use App\Models\NutritionTarget;
use App\Http\Traits\HasAuthenticatedUser;

class NutritionTargetService
{
    use HasAuthenticatedUser;


    public function getTarget(): ?NutritionTarget
    {
        $user = $this->getAuthenticatedUser();
        
        return NutritionTarget::where('user_id', $user->id)->first();
    }

    public function updateTarget(array $targetData): NutritionTarget
    {
        $user = $this->getAuthenticatedUser();
        
        $target = NutritionTarget::updateOrCreate(
            ['user_id' => $user->id],
            $targetData
        );
        
        return $target->fresh();
    }
    
}

