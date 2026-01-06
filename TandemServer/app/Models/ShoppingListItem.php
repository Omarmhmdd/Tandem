<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShoppingListItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'shopping_list_id',
        'name',
        'quantity',
        'unit',
        'in_pantry',
        'pantry_item_id',
        'purchased',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'in_pantry' => 'boolean',
            'purchased' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function shoppingList()
    {
        return $this->belongsTo(ShoppingList::class);
    }

    public function pantryItem()
    {
        return $this->belongsTo(PantryItem::class);
    }

    public static function rules()
    {
        return [
            'shopping_list_id' => 'required|exists:shopping_lists,id',
            'name' => 'required|string|max:255|min:1',
            'quantity' => 'required|numeric|min:0.01',
            'unit' => 'required|string|max:50',
            'in_pantry' => 'required|boolean',
            'pantry_item_id' => 'nullable|exists:pantry_items,id',
            'purchased' => 'required|boolean',
        ];
    }
}

