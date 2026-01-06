<?php

namespace App\Services;

use App\Models\ShoppingList;
use App\Models\ShoppingListItem;
use App\Models\MealPlan;
use App\Models\PantryItem;
use App\Data\ShoppingListData;
use App\Data\ShoppingListItemData;
use App\Http\Traits\VerifiesResourceOwnership;
use App\Http\Traits\HasDatabaseTransactions;

class ShoppingListService
{
    use VerifiesResourceOwnership, HasDatabaseTransactions;

    public function generateShoppingList(int $planId): ShoppingList
    {
        $householdMember = $this->getActiveHouseholdMember();
        $user = $this->getAuthenticatedUser();

        return $this->transaction(function () use ($planId, $householdMember, $user) {
            $mealPlan = $this->findMealPlanForHousehold($planId, $householdMember->household_id);
            
            $shoppingList = ShoppingList::create(
                ShoppingListData::prepare($householdMember, $mealPlan, $user)
            );

            $this->addItemsToShoppingList($shoppingList, $mealPlan, $householdMember->household_id);

            return $shoppingList->load('items.pantryItem');
        });
    }

    protected function findMealPlanForHousehold(int $planId, int $householdId): MealPlan
    {
        return MealPlan::where('id', $planId)
            ->where('household_id', $householdId)
            ->with('recipe.ingredients')
            ->firstOrFail();
    }

    protected function addItemsToShoppingList(ShoppingList $shoppingList, MealPlan $mealPlan, int $householdId): void
    {
        $ingredientsNeeded = $this->aggregateIngredients($mealPlan);

        foreach ($ingredientsNeeded as $ingredient) {
            $pantryItem = $this->findPantryItemByName($ingredient['ingredient_name'], $householdId);
            $actualNeeded = $this->calculateNeededQuantity($ingredient, $pantryItem);

            if ($actualNeeded > 0) {
                ShoppingListItem::create(
                    ShoppingListItemData::prepare(
                        $shoppingList,
                        $ingredient,
                        $pantryItem,
                        $actualNeeded
                    ) );  } }
    }

    protected function aggregateIngredients(MealPlan $mealPlan): array
    {
        $ingredientsNeeded = [];

        if (!$mealPlan->recipe) {
            return $ingredientsNeeded;
        }

        foreach ($mealPlan->recipe->ingredients as $ingredient) {
            $key = strtolower($ingredient->ingredient_name);
            
            if (!isset($ingredientsNeeded[$key])) {
                $ingredientsNeeded[$key] = [
                    'ingredient_name' => $ingredient->ingredient_name,
                    'quantity_needed' => 0,
                    'unit' => $ingredient->unit,
                ];
            }
            
            $ingredientsNeeded[$key]['quantity_needed'] += $ingredient->quantity ?? 0;
        }

        return array_values($ingredientsNeeded);
    }

    protected function calculateNeededQuantity(array $ingredient, ?PantryItem $pantryItem): float
    {
        $quantityNeeded = $ingredient['quantity_needed'];

        if ($pantryItem && $pantryItem->quantity >= $quantityNeeded) {
            return 0;
        }

        return $pantryItem 
            ? max(0, $quantityNeeded - $pantryItem->quantity) 
            : $quantityNeeded;
    }

    protected function findPantryItemByName(string $ingredientName, int $householdId): ?PantryItem
    {
        return PantryItem::where('household_id', $householdId)
            ->whereRaw('LOWER(name) = ?', [strtolower($ingredientName)])
            ->first();
    }
}