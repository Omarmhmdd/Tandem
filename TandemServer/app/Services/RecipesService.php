<?php

namespace App\Services;

use App\Models\Recipe;
use App\Models\RecipeIngredient;
use App\Models\RecipeInstruction;
use App\Models\RecipeTag;
use App\Models\RecipeIngredientPantryLink;
use App\Models\PantryItem;
use App\Data\RecipeIngredientData;
use App\Data\RecipeInstructionData;
use App\Data\RecipeTagData;
use App\Http\Traits\VerifiesResourceOwnership;
use App\Http\Traits\HasDatabaseTransactions;

class RecipesService
{
    use VerifiesResourceOwnership, HasDatabaseTransactions;

    public function getAll(): \Illuminate\Support\Collection
    {
        $householdMember = $this->getActiveHouseholdMemberOrNull();

        if (!$householdMember) {
            return collect([]);
        }

        return Recipe::where('household_id', $householdMember->household_id)
            ->with(['ingredients', 'instructions', 'tags'])
            ->orderBy('name', 'asc')
            ->get();
    }

    public function getById(int $id): Recipe
    {
        $householdMember = $this->getActiveHouseholdMember();

        return Recipe::where('id', $id)
            ->where('household_id', $householdMember->household_id)
            ->with(['ingredients', 'instructions', 'tags'])
            ->firstOrFail();
    }

    public function create(array $recipeData, array $ingredientsData, array $instructionsData, array $tagsData): Recipe
    {
        return $this->transaction(function () use ($recipeData, $ingredientsData, $instructionsData, $tagsData) {
            $recipe = Recipe::create($recipeData);

            $this->attachIngredients($recipe->id, $ingredientsData);
            $this->attachInstructions($recipe->id, $instructionsData);
            $this->attachTags($recipe->id, $tagsData);

            return $recipe->load(['ingredients', 'instructions', 'tags']);
        });
    }

    public function update(int $id, array $recipeData, ?array $ingredientsData, ?array $instructionsData, ?array $tagsData): Recipe
    {
        $householdMember = $this->getActiveHouseholdMember();

        return $this->transaction(function () use ($id, $householdMember, $recipeData, $ingredientsData, $instructionsData, $tagsData) {
            $recipe = $this->findRecipeForHousehold($id, $householdMember->household_id);
            $recipe->update($recipeData);

            if ($ingredientsData !== null) {
                $this->syncIngredients($recipe->id, $ingredientsData);
            }

            if ($instructionsData !== null) {
                $this->syncInstructions($recipe->id, $instructionsData);
            }

            if ($tagsData !== null) {
                $this->syncTags($recipe->id, $tagsData);
            }

            return $recipe->fresh()->load(['ingredients', 'instructions', 'tags']);
        });
    }

    public function delete(int $id): void
    {
        $householdMember = $this->getActiveHouseholdMember();
        $recipe = $this->findRecipeForHousehold($id, $householdMember->household_id);
        $recipe->delete();
    }

    public function linkPantryItems(int $recipeId, array $linksData): void
    {
        $householdMember = $this->getActiveHouseholdMember();
        $recipe = $this->findRecipeForHousehold($recipeId, $householdMember->household_id);

        $this->transaction(function () use ($linksData, $recipe, $householdMember) {
            foreach ($linksData as $link) {
                $this->createPantryLink($link, $recipe->id, $householdMember->household_id);
            }
        });
    }


    protected function findRecipeForHousehold(int $id, int $householdId): Recipe
    {
        return Recipe::where('id', $id)
            ->where('household_id', $householdId)
            ->firstOrFail();
    }

    protected function attachIngredients(int $recipeId, array $ingredientsData): void
    {
        $preparedIngredients = RecipeIngredientData::prepareMany($ingredientsData);
        
        foreach ($preparedIngredients as $ingredient) {
            RecipeIngredient::create(array_merge($ingredient, ['recipe_id' => $recipeId]));
        }
    }

    protected function attachInstructions(int $recipeId, array $instructionsData): void
    {
        $preparedInstructions = RecipeInstructionData::prepareMany($instructionsData);
        
        foreach ($preparedInstructions as $instruction) {
            RecipeInstruction::create(array_merge($instruction, ['recipe_id' => $recipeId]));
        }
    }


    protected function attachTags(int $recipeId, array $tagsData): void
    {
        foreach ($tagsData as $tag) {
            RecipeTag::create([
                'recipe_id' => $recipeId,
                'tag' => $tag,
            ]);
        }
    }

    protected function syncIngredients(int $recipeId, array $ingredientsData): void
    {
        RecipeIngredient::where('recipe_id', $recipeId)->delete();
        $this->attachIngredients($recipeId, $ingredientsData);
    }


    protected function syncInstructions(int $recipeId, array $instructionsData): void
    {
        RecipeInstruction::where('recipe_id', $recipeId)->delete();
        $this->attachInstructions($recipeId, $instructionsData);
    }


    protected function syncTags(int $recipeId, array $tagsData): void
    {
        RecipeTag::where('recipe_id', $recipeId)->delete();
        $this->attachTags($recipeId, $tagsData);
    }

    protected function createPantryLink(array $link, int $recipeId, int $householdId): void
    {
        $recipeIngredient = RecipeIngredient::where('id', $link['recipe_ingredient_id'])
            ->where('recipe_id', $recipeId)
            ->firstOrFail();

        $pantryItem = PantryItem::where('id', $link['pantry_item_id'])
            ->where('household_id', $householdId)
            ->firstOrFail();

        RecipeIngredientPantryLink::updateOrCreate(
            [
                'recipe_ingredient_id' => $link['recipe_ingredient_id'],
                'pantry_item_id' => $link['pantry_item_id'],
            ],
            [
                'quantity_used' => $link['quantity_used'] ?? null,
            ]
        );
    }
}