<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RecipeTag extends Model
{
    use HasFactory;

    public $timestamps = false;
    protected $fillable = [
        'recipe_id',
        'tag',
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
            'tag' => 'required|string|max:100',
        ];
    }
}

