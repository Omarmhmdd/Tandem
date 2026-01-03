<?php

namespace App\Http\Controllers;

use App\Services\PantryService;
use App\Http\Requests\CreatePantryItemRequest;
use App\Http\Requests\UpdatePantryItemRequest;
use App\Http\Resources\PantryItemResource;
use App\Http\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class PantryController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected PantryService $pantryService
    ) {}

    public function index(): JsonResponse
    {
        $items = $this->pantryService->getAll();

        return $this->success([
            'items' => PantryItemResource::collection($items),
        ]);
    }

    public function store(CreatePantryItemRequest $request): JsonResponse
    {
        $item = $this->pantryService->create($request->getPantryItemData());

        return $this->created([
            'item' => new PantryItemResource($item),
        ], 'Pantry item created successfully');
    }

    public function update(UpdatePantryItemRequest $request, int $id): JsonResponse
    {
        $item = $this->pantryService->update($id, $request->getPantryItemData());

        return $this->success([
            'item' => new PantryItemResource($item),
        ], 'Pantry item updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $this->pantryService->delete($id);

        return $this->success(null, 'Pantry item deleted successfully');
    }
}