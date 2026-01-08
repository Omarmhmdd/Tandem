    import { useHabits as useHabitsQuery, useHabitMutation, useDeleteHabit, useToggleHabitCompletion } from '../api/queries/habits';
    import type { Habit, HabitFormData } from '../types/habit.types';
    import { showToast } from '../utils/toast';
    import {calculateStreakAfterToggle,isCompletedToday,getTodayDateString,formatStreakMessage,validateHabitForm,createHabitData,shouldCompleteHabit,} from '../utils/habitHelpers';

    const handleApiError = (error: unknown, defaultMessage: string): void => {
    const errorMessage = error instanceof Error ? error.message : defaultMessage;
    showToast(errorMessage, 'error');
    };

    export const useHabits = () => {
    const { data: habits = [], isLoading, error } = useHabitsQuery();
    const mutation = useHabitMutation();
    const deleteMutation = useDeleteHabit();
    const toggleMutation = useToggleHabitCompletion();

    const saveHabit = async (formData: HabitFormData, editingHabit: Habit | null): Promise<boolean> => {
        const validation = validateHabitForm(formData);
        if (!validation.isValid) {showToast(validation.error || 'Invalid input', 'error');
        return false;
        }

        const habitData = createHabitData(formData, editingHabit);

        try {
        await mutation.mutateAsync({ habit: habitData, isEdit: !!editingHabit });
        showToast(editingHabit ? 'Habit updated successfully' : 'Habit created successfully','success');
        return true;
        } catch (error) {
        handleApiError(error, 'Failed to save habit');
        return false;
        }
    };

    const deleteHabit = async (id: string): Promise<void> => {
        try {
        await deleteMutation.mutateAsync(id);
        showToast('Habit deleted successfully', 'success');
        } catch (error) {
        handleApiError(error, 'Failed to delete habit');
        }
    };

    const toggleCompletion = async (habitId: string, date?: string): Promise<void> => {
        const habit = habits.find(h => h.id === habitId);
        if (!habit) {
        showToast('Habit not found', 'error');
        return;
        }

        const today = date || getTodayDateString();
        const isCompleting = shouldCompleteHabit(habit, today);

        try {
        await toggleMutation.mutateAsync({ habitId, date: today, completed: isCompleting });

        if (isCompleting) {
            const newStreak = calculateStreakAfterToggle(habit, true);
            const message = formatStreakMessage(habit.name, newStreak);
            showToast(message, 'success');
        } else {
            showToast(`${habit.name} unchecked`, 'info');
        }
        } catch (error) {
        handleApiError(error, 'Failed to update completion');
        }
    };

    return {
        habits,
        isLoading,
        error,
        saveHabit,
        deleteHabit,
        toggleCompletion,
        isCompletedToday,
    };
    };