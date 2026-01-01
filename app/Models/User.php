<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'email',
        'password',
        'password_hash',
        'first_name',
        'last_name',
    ];

    protected $hidden = [
        'password_hash',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }


    public function getAuthPassword()
    {
        return $this->password_hash;
    }


    public function getPasswordAttribute()
    {
        return $this->password_hash;
    }


    public function setPasswordAttribute($value)
    {
        $this->attributes['password_hash'] = Hash::make($value);
    }


    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }


    public static function rules($userId = null)
    {
        return [
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($userId)],
            'password' => $userId ? 'sometimes|min:8' : 'required|min:8',
            'first_name' => 'required|string|max:100|min:1',
            'last_name' => 'required|string|max:100|min:1',
        ];
    }
}
