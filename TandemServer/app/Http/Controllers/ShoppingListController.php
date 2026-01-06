<?php

namespace App\Http\Controllers;

use App\Services\ShoppingListService;
use App\Http\Resources\ShoppingListResource;
use App\Http\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class ShoppingListController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected ShoppingListService $shoppingListService
    ) {}

    public function generate(int $planId): JsonResponse
    {
        $shoppingList = $this->shoppingListService->generateShoppingList($planId);

        return $this->created([
            'shopping_list' => new ShoppingListResource($shoppingList),
        ], 'Shopping list generated successfully');
    }
}

