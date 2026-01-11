import type { Goal, GoalCompletionStatus } from '../types/goal.types';
import { QUICK_ADD_AMOUNTS } from './constants';

/**
 * Calculate the progress percentage of a goal
 * @param goal - The goal object
 * @returns Progress percentage (0-100)
 */
export const calculateProgress = (goal: Goal): number => {
  if (goal.target === 0) return 0;
  return Math.min((goal.current / goal.target) * 100, 100);
};

/**
 * Get the completion status of a goal including milestone checks
 * @param goal - The goal object
 * @returns GoalCompletionStatus with all completion details
 */
export const getGoalCompletionStatus = (goal: Goal): GoalCompletionStatus => {
  const progress = calculateProgress(goal);
  const hasMilestones = goal.milestones && goal.milestones.length > 0;
  const allMilestonesComplete = hasMilestones
    ? goal.milestones.every(m => m.completed)
    : true;
  
  // Goal is considered complete only if:
  // 1. Progress is 100% AND
  // 2. All milestones are complete (if milestones exist)
  const isComplete = progress >= 100 && allMilestonesComplete;
  
  return {
    isComplete,
    progress,
    allMilestonesComplete,
    hasMilestones: !!hasMilestones,
    canReachGoal: !hasMilestones || allMilestonesComplete || progress < 100,
  };
};

/**
 * Get the color classes for a goal category
 * @param category - The goal category
 * @returns Tailwind CSS classes for the category
 */
export const getCategoryColor = (category: Goal['category']): string => {
  const colors: Record<Goal['category'], string> = {
    wedding: 'bg-pink-100 text-pink-700 border-pink-300',
    health: 'bg-green-100 text-green-700 border-green-300',
    financial: 'bg-blue-100 text-blue-700 border-blue-300',
    other: 'bg-gray-100 text-gray-700 border-gray-300',
  };
  return colors[category] || colors.other;
};

/**
 * Get quick add suggestions based on goal unit and remaining amount
 * @param goal - The goal object
 * @returns Array of suggested amounts to add
 */
export const getQuickAddSuggestions = (goal: Goal): number[] => {
  const remaining = goal.target - goal.current;
  
  if (goal.unit === '$' || goal.unit.toLowerCase().includes('dollar')) {
    return QUICK_ADD_AMOUNTS.dollar.filter(s => s <= remaining && s <= goal.target * 0.1);
  } else if (goal.unit === 'steps' || goal.unit.toLowerCase().includes('step')) {
    return QUICK_ADD_AMOUNTS.steps.filter(s => s <= remaining);
  } else {
    return QUICK_ADD_AMOUNTS.defaultPercentages
      .map(percentage => Math.round(remaining * percentage))
      .filter(s => s > 0 && s <= remaining);
  }
};

