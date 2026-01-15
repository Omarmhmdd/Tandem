import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import  type{ Habit } from '../../types/habit.types';
import type { HabitsResponse, SingleHabitResponse } from '../../types/api.types';
import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { transformHabit } from '../../utils/transforms/habitTransforms';

export const useHabits = () => {
  return useQuery({
    queryKey: ['habits'],
    queryFn: async () => {
      const response = await apiClient.get<HabitsResponse>(ENDPOINTS.HABITS);
      const habits = response.data.habits || [];
      return habits.map(transformHabit);
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useHabitMutation = () => {
  const queryClient = useQueryClient();

  // Helper to detect browser timezone
  const getUserTimezone = (): string => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return 'UTC';
    }
  };

  return useMutation({
    mutationFn: async ({ habit, isEdit }: { habit: Habit; isEdit: boolean }) => {
      // Prepare payload - include timezone if reminder_time is set
      const payload: any = {
        name: habit.name,
        description: habit.description || null,
        frequency: habit.frequency,
      };

      // Only include reminder_time if it's actually set (not empty string)
      if (habit.reminderTime && habit.reminderTime.trim() !== '') {
        payload.reminder_time = habit.reminderTime;
        payload.timezone = getUserTimezone();
      } else {
        payload.reminder_time = null;
      }

      if (isEdit) {
        const response = await apiClient.post<SingleHabitResponse>(
          ENDPOINTS.HABIT_UPDATE(habit.id),
          payload
        );
        return transformHabit(response.data.habit);
      } else {
        const response = await apiClient.post<SingleHabitResponse>(
          ENDPOINTS.HABITS,
          payload
        );
        return transformHabit(response.data.habit);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
};

export const useDeleteHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(ENDPOINTS.HABIT_DELETE(id));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
};

export const useToggleHabitCompletion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ habitId, date, completed }: { habitId: string; date: string; completed: boolean }) => {
      await apiClient.post(ENDPOINTS.HABIT_COMPLETIONS(habitId), { date, completed });
      return { habitId, date, completed };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
};

