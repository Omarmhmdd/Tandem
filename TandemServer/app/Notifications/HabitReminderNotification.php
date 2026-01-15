<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class HabitReminderNotification extends Notification
{
    use Queueable;

    public function __construct(
        public int $habitId,
        public string $habitName,
        public string $reminderTime
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'habit_id' => $this->habitId,
            'habit_name' => $this->habitName,
            'reminder_time' => $this->reminderTime,
            'message' => "Time for your habit: {$this->habitName}",
        ];
    }
}

