import type { Goal, Milestone, BackendGoal, BackendMilestone } from '../../types/goal.types';

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

