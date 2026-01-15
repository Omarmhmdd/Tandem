export interface HabitReminderData {
  habit_id: number;
  habit_name: string;
  reminder_time: string;
  message: string;
}

export interface MatchMealData {
  match_meal_id: number;
  meal_plan_id: number;
  invited_by_name: string;
  recipe_name: string;
  meal_date: string;
  meal_type: string;
  message: string;
}

export interface Notification {
  id: string;
  type: string;
  data: HabitReminderData | MatchMealData;
  read_at: string | null;
  created_at: string;
}

export interface NotificationsResponse {
  data: {
    notifications: Notification[];
  };
  message?: string;
}

