<?php

namespace App\Http\Controllers;

use App\Services\AutoOrderService;
use App\Http\Requests\SendAutoOrderRequest;
use App\Http\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class AutoOrderController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected AutoOrderService $autoOrderService
    ) {}

    public function getPartners(): JsonResponse
    {
        $partners = $this->autoOrderService->getPartners();

        return $this->success([
            'partners' => $partners,
        ]);
    }

    public function sendOrder(SendAutoOrderRequest $request): JsonResponse
    {
        $result = $this->autoOrderService->sendOrder(
            $request->getShoppingListItems(),
            $request->getPartnerId()
        );

        return $this->created($result, 'Order submitted successfully');
    }
}


