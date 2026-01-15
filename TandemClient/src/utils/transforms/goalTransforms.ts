import type { Goal, Milestone, BackendGoal, BackendMilestone, GoalsAggregatedData } from '../../types/goal.types';
import type { GoalsAggregatedResponse } from '../../types/api.types';

export const transformMilestone = (milestone: BackendMilestone): Milestone => ({
  id: String(milestone.id),
  title: milestone.title || '',
  completed: milestone.completed || false,
  deadline: milestone.deadline || undefined,
});

export const transformGoal = (goal: BackendGoal): Goal => ({
  id: String(goal.id),
  title: goal.title,
  category: goal.category as Goal['category'],
  target: goal.target,
  current: goal.current,
  unit: goal.unit,
  deadline: goal.deadline || undefined,
  completed_at: goal.completed_at || undefined,
  milestones: Array.isArray(goal.milestones) && goal.milestones.length > 0
    ? goal.milestones.map(transformMilestone)
    : [],
});

export const transformGoalToBackend = (goal: Goal): {
  title: string;
  category: string;
  target: number;
  current: number;
  unit: string;
  deadline: string | null;
  is_household: boolean;
} => {
  return {
    title: goal.title,
    category: goal.category,
    target: goal.target,
    current: goal.current,
    unit: goal.unit,
    deadline: goal.deadline || null,
    is_household: true,
    // Note: Milestones are managed separately via milestone endpoints
    // They are not included in goal create/update payload
  };
};

export const transformMilestoneToBackend = (milestone: Omit<Milestone, 'id'> | Partial<Milestone>): {
  title: string;
  completed: boolean;
  deadline?: string | null;
  order?: number;
} => {
  return {
    title: milestone.title || '',
    completed: milestone.completed ?? false,
    deadline: milestone.deadline || null,
    order: 0, // Default order, can be set by backend
  };
};

export const transformGoalsAggregated = (
  data: GoalsAggregatedResponse['data']
): GoalsAggregatedData => {
  return {
    goals: (data.goals || []).map(transformGoal),
    budgetSummary: data.budget_summary,
  };
};
