<?php

namespace App\Http\Controllers;

use App\Services\RecipesService;
use App\Http\Requests\CreateRecipeRequest;
use App\Http\Requests\UpdateRecipeRequest;
use App\Http\Requests\LinkPantryRequest;
use App\Http\Resources\RecipeResource;
use App\Http\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class RecipesController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected RecipesService $recipesService
    ) {}

    public function index(): JsonResponse
    {
        $recipes = $this->recipesService->getAll();

        return $this->success([
            'recipes' => RecipeResource::collection($recipes),
        ]);
    }

    public function store(CreateRecipeRequest $request): JsonResponse
    {
        $recipe = $this->recipesService->create($request->getRecipeData(),$request->getIngredientsData(),$request->getInstructionsData(),$request->getTagsData());

        return $this->created([
            'recipe' => new RecipeResource($recipe),
        ], 'Recipe created successfully');
    }

    public function show(int $id): JsonResponse
    {
        $recipe = $this->recipesService->getById($id);

        return $this->success([
            'recipe' => new RecipeResource($recipe),
        ]);
    }

    public function update(UpdateRecipeRequest $request, int $id): JsonResponse
    {
        $recipe = $this->recipesService->update(
            $id,
            $request->getRecipeData(),
            $request->getIngredientsData(),
            $request->getInstructionsData(),
            $request->getTagsData()
        );

        return $this->success([
            'recipe' => new RecipeResource($recipe),
        ], 'Recipe updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $this->recipesService->delete($id);

        return $this->success(null, 'Recipe deleted successfully');
    }

    public function linkPantry(LinkPantryRequest $request, int $id): JsonResponse
    {
        $this->recipesService->linkPantryItems($id, $request->getLinksData());

        return $this->success(null, 'Pantry items linked successfully');
    }
}