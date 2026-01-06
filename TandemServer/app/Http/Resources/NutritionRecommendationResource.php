<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NutritionRecommendationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'partnersIntake' => $this->resource['partnersIntake'] ?? [],
            'recommendations' => $this->resource['recommendations'] ?? [],
            'suggestedMeals' => $this->resource['suggestedMeals'] ?? [],
            'targets' => $this->resource['targets'] ?? [],
        ];
    }
}