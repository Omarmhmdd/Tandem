import { useGoalsAggregated, useGoalMutation, useDeleteGoal, useUpdateGoalProgress } from '../api/queries/goals';
import type { Goal, GoalFormData } from '../types/goal.types';
import { calculateProgress, getGoalCompletionStatus, getQuickAddSuggestions } from '../utils/goalHelpers';
import { showToast } from '../utils/toast';

export const useGoalsPage = () => {
  // Fetch all goals data in a single aggregated call
  const { data: aggregatedData, isLoading } = useGoalsAggregated();
  
  // Extract data from aggregated response
  const goals = aggregatedData?.goals || [];
  const budgetSummary = aggregatedData?.budgetSummary;
  const mutation = useGoalMutation();
  const deleteMutation = useDeleteGoal();
  const updateProgressMutation = useUpdateGoalProgress();

  const saveGoal = async (formData: GoalFormData, editingGoal: Goal | null): Promise<Goal | null> => {
    if (!formData.title || !formData.target) {
      showToast('Please fill in all required fields', 'error');
      return null;
    }

    if (formData.target <= 0) {
      showToast('Target must be greater than 0', 'error');
      return null;
    }

    // For new goals, don't generate ID - let backend handle it
    // For updates, use existing goal ID
    const goalData: Goal = {
      ...formData,
      id: editingGoal?.id || '', // Empty string for new goals - backend will generate
      milestones: formData.milestones || [],
    };

    try {
      const savedGoal = await mutation.mutateAsync({ goal: goalData, isUpdate: !!editingGoal });
      showToast(
        editingGoal ? 'Goal updated successfully' : 'Goal created successfully',
        'success'
      );
      return savedGoal;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message || 'Failed to save goal'
        : 'Failed to save goal';
      showToast(errorMessage, 'error');
      return null;
    }
  };

  const deleteGoal = async (id: string): Promise<void> => {
    try {
      await deleteMutation.mutateAsync(id);
      showToast('Goal deleted successfully', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message || 'Failed to delete goal'
        : 'Failed to delete goal';
      showToast(errorMessage, 'error');
    }
  };

  const updateProgress = async (goalId: string, newCurrent: number): Promise<void> => {
    if (newCurrent < 0) {
      showToast('Progress cannot be negative', 'error');
      return;
    }

    try {
      await updateProgressMutation.mutateAsync({ id: goalId, current: newCurrent });
      showToast('Progress updated', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message || 'Failed to update progress'
        : 'Failed to update progress';
      showToast(errorMessage, 'error');
    }
  };

  const quickAdd = async (goalId: string, amount: number): Promise<void> => {
    // Input validation
    if (amount <= 0) {
      showToast('Amount must be greater than 0', 'error');
      return;
    }

    const goal = goals.find((g: Goal) => g.id === goalId);
    if (!goal) {
      showToast('Goal not found', 'error');
      return;
    }

    const newValue = Math.min(goal.current + amount, goal.target);
    
    // Check if goal is already at target
    if (goal.current >= goal.target) {
      showToast('Goal is already at target', 'info');
      return;
    }

    await updateProgress(goalId, newValue);
  };


  return {
    goals,
    budgetSummary,
    isLoading,
    getProgress: calculateProgress,
    getGoalCompletionStatus,
    saveGoal,
    deleteGoal,
    updateProgress,
    quickAdd,
    getQuickAddSuggestions,
  };
};

