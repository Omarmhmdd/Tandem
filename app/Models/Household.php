<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Household extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    // Relationships
    public function members()
    {
        return $this->hasMany(HouseholdMember::class);
    }

    public function primaryMember()
    {
        return $this->hasOne(HouseholdMember::class)->where('role', 'primary');
    }

    public function partner()
    {
        return $this->hasOne(HouseholdMember::class)->where('role', 'partner');
    }


}
