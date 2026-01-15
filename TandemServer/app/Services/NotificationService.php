<?php

namespace App\Services;

use App\Http\Traits\HasAuthenticatedUser;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Collection;

class NotificationService
{
    use HasAuthenticatedUser;

    public function getAll(): Collection
    {
        $user = $this->getAuthenticatedUser();
        
        return $user->notifications()->latest()->get();
    }

    public function getUnread(): Collection
    {
        $user = $this->getAuthenticatedUser();
        
        return $user->unreadNotifications()->latest()->get();
    }

    public function markAsRead(string $notificationId): void
    {
        $user = $this->getAuthenticatedUser();
        
        $notification = $user->notifications()
            ->where('id', $notificationId)
            ->firstOrFail();
            
        // Delete the notification instead of marking as read
        $notification->delete();
    }

    public function markAllAsRead(): void
    {
        $user = $this->getAuthenticatedUser();
        
        // Delete all unread notifications instead of marking as read
        $user->unreadNotifications()->delete();
    }
}

