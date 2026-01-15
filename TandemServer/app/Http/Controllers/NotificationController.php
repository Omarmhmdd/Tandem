<?php

namespace App\Http\Controllers;

use App\Services\NotificationService;
use App\Http\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected NotificationService $notificationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $unreadOnly = $request->boolean('unread_only', false);
        
        $notifications = $unreadOnly ? $this->notificationService->getUnread(): $this->notificationService->getAll();

        return $this->success([
            'notifications' => $notifications->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'data' => $notification->data,
                    'read_at' => $notification->read_at?->toIso8601String(),
                    'created_at' => $notification->created_at->toIso8601String(),
                ];
            }),
        ]);
    }

    public function markAsRead(string $id): JsonResponse
    {
        $this->notificationService->markAsRead($id);

        return $this->success(null, 'Notification deleted');
    }

    public function markAllAsRead(): JsonResponse
    {
        $this->notificationService->markAllAsRead();

        return $this->success(null, 'All notifications deleted');
    }
}

