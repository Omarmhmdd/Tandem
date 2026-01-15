<?php

namespace App\Console\Commands;

use App\Models\Habit;
use App\Notifications\HabitReminderNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class SendHabitRemindersCommand extends Command
{
    protected $signature = 'habits:send-reminders';
    protected $description = 'Send reminder notifications for habits based on reminder_time';

    public function handle()
    {
        $habits = Habit::whereNotNull('reminder_time')
            ->with('user')
            ->get();

        $sentCount = 0;

        foreach ($habits as $habit) {
            $user = $habit->user;
            
            // Get user's timezone or default to UTC
            $userTimezone = $user->timezone ?? 'UTC';
            
            // Get current time in user's timezone
            $nowInUserTimezone = Carbon::now($userTimezone);
            $currentTime = $nowInUserTimezone->format('H:i');
            
            // Get reminder time from habit (stored as TIME field, format: H:i)
            $reminderTime = Carbon::parse($habit->reminder_time)->format('H:i');
            
            // Compare current time in user's timezone with reminder time
            if ($currentTime === $reminderTime) {
                $habit->user->notify(new HabitReminderNotification(
                    $habit->id,
                    $habit->name,
                    $reminderTime
                ));
                $sentCount++;
            }
        }

        if ($sentCount > 0) {
            $this->info("Sent {$sentCount} habit reminder notification(s).");
        } else {
            $this->info('No habit reminders to send at this time.');
        }

        return Command::SUCCESS;
    }
}

