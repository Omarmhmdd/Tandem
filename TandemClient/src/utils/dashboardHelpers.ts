import type { Goal } from '../types/goal.types';
import type { LogEntry } from '../types/health.types';
import type { HouseholdMember } from '../types/household.type';
import { getGoalCompletionStatus } from './goalHelpers';
import { GOAL_COMPLETION_THRESHOLD } from './constants';


export const isGoalCompleted = (goal: Goal): boolean => {
  const status = getGoalCompletionStatus(goal);
  return status.isComplete && status.progress >= GOAL_COMPLETION_THRESHOLD;
};


export const getWeekStart = (): Date => {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
};


export const calculateAverageSleep = (logs: LogEntry[]): string => {
  if (logs.length === 0) return '0';
  
  const total = logs.reduce((sum, log) => {
    const hours = log.sleep?.hours || 0;
    return sum + hours;
  }, 0);
  
  return (total / logs.length).toFixed(1);
};


export const getPartnerName = (
  userId: string | undefined,
  members: HouseholdMember[]
): string | null => {
  if (!userId || members.length < 2) return null;
  
  const partner = members.find(
    m => m.userId !== userId && m.status === 'active'
  );
  
  return partner?.user?.first_name || null;
};

