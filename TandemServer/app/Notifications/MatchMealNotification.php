<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MatchMealNotification extends Notification
{
    use Queueable;

    public function __construct(
        public int $matchMealId,
        public int $mealPlanId,
        public string $invitedByName,
        public string $recipeName,
        public string $mealDate,
        public string $mealType
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'match_meal_id' => $this->matchMealId,
            'meal_plan_id' => $this->mealPlanId,
            'invited_by_name' => $this->invitedByName,
            'recipe_name' => $this->recipeName,
            'meal_date' => $this->mealDate,
            'meal_type' => $this->mealType,
            'message' => "{$this->invitedByName} invited you to a match meal: {$this->recipeName}",
        ];
    }
}

