<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RecipeInstruction extends Model
{
    use HasFactory;

    public $timestamps = false;
    protected $fillable = [
        'recipe_id',
        'step_number',
        'instruction',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function recipe()
    {
        return $this->belongsTo(Recipe::class);
    }

    public static function rules()
    {
        return [
            'recipe_id' => 'required|exists:recipes,id',
            'step_number' => 'required|integer|min:1',
            'instruction' => 'required|string',
        ];
    }
}

