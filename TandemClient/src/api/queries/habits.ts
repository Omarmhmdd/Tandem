import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import  type{ Habit } from '../../types/habit.types';
import type { HabitsResponse, SingleHabitResponse } from '../../types/api.types';
import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';

export const useHabits = () => {
  return useQuery({
    queryKey: ['habits'],
    queryFn: async () => {
      const response = await apiClient.get<HabitsResponse>(ENDPOINTS.HABITS);
      return response.data.habits || [];
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useHabitMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ habit, isEdit }: { habit: Habit; isEdit: boolean }) => {
      if (isEdit) {
        const response = await apiClient.post<SingleHabitResponse>(
          ENDPOINTS.HABIT_UPDATE(habit.id),
          habit
        );
        return response.data.habit;
      } else {
        const response = await apiClient.post<SingleHabitResponse>(
          ENDPOINTS.HABITS,
          habit
        );
        return response.data.habit;
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

