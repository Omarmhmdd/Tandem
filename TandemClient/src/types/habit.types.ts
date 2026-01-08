export interface HabitCompletion {
  date: string;
  completed: boolean;
  notes?: string;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'custom';
  reminderTime?: string;
  completions: HabitCompletion[];
}

export interface HabitFormData {
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'custom';
  reminderTime?: string;
}


