import type { Habit, HabitCompletion } from '../../types/habit.types';

export interface BackendHabit {
  id: number | string;
  user_id?: number | string;
  name: string;
  description?: string | null;
  frequency: 'daily' | 'weekly' | 'custom';
  reminder_time?: string | null;
  completions?: BackendHabitCompletion[];
  created_at?: string;
  updated_at?: string;
}

export interface BackendHabitCompletion {
  date: string;
  completed: boolean;
  notes?: string | null;
}

export const transformHabit = (backendHabit: BackendHabit): Habit => {
  return {
    id: String(backendHabit.id),
    name: backendHabit.name,
    description: backendHabit.description || undefined,
    frequency: backendHabit.frequency,
    reminderTime: backendHabit.reminder_time || undefined,
    completions: (backendHabit.completions || []).map((c: BackendHabitCompletion): HabitCompletion => ({
      date: c.date,
      completed: c.completed,
      notes: c.notes || undefined,
    })),
  };
};

