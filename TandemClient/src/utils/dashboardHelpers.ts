import type { Goal } from '../types/goal.types';
import type { LogEntry } from '../types/health.types';
import type { HouseholdMember } from '../types/household.type';
import { getGoalCompletionStatus } from './goalHelpers';
import { GOAL_COMPLETION_THRESHOLD } from './constants';


export const isGoalCompleted = (goal: Goal): boolean => {
  const status = getGoalCompletionStatus(goal);
  return status.isComplete && status.progress >= GOAL_COMPLETION_THRESHOLD;
};


/**
 * Get the start of the current week (Monday)
 * This matches Laravel's Carbon startOfWeek() behavior
 */
export const getWeekStart = (): Date => {
  const weekStart = new Date();
  const day = weekStart.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  // Calculate days to subtract to get to Monday
  // Sunday (0) -> subtract 6 days, Monday (1) -> subtract 0, Tuesday (2) -> subtract 1, etc.
  const daysToSubtract = day === 0 ? 6 : day - 1;
  weekStart.setDate(weekStart.getDate() - daysToSubtract);
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

/**
 * Get the start of the previous completed week (Monday)
 * This is the week that just ended (for which we should generate summaries)
 * Simply get the current week start and subtract 7 days
 */
export const getPreviousWeekStart = (): Date => {
  const currentWeekStart = getWeekStart();
  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);
  return previousWeekStart;
};

/**
 * Get the previous week start date as a string in YYYY-MM-DD format
 * This matches the format used by the backend
 * This is the week that just ended (for which summaries should be generated)
 */
export const getPreviousWeekStartString = (): string => {
  const weekStart = getPreviousWeekStart();
  const year = weekStart.getFullYear();
  const month = String(weekStart.getMonth() + 1).padStart(2, '0');
  const day = String(weekStart.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get the current week start date as a string in YYYY-MM-DD format
 * This matches the format used by the backend
 */
export const getCurrentWeekStartString = (): string => {
  const weekStart = getWeekStart();
  const year = weekStart.getFullYear();
  const month = String(weekStart.getMonth() + 1).padStart(2, '0');
  const day = String(weekStart.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Check if a summary exists for the previous completed week
 * This is the week that just ended and should have a summary
 */
export const hasSummaryForPreviousWeek = (summaries: Array<{ week_start: string }>): boolean => {
  if (summaries.length === 0) return false;
  
  const previousWeekStart = getPreviousWeekStartString();
  return summaries.some(summary => summary.week_start === previousWeekStart);
};

/**
 * Check if a week_start is for the current week (should not be displayed)
 */
export const isCurrentWeek = (weekStart: string): boolean => {
  const currentWeekStart = getCurrentWeekStartString();
  return weekStart === currentWeekStart;
};

/**
 * Get the most recent completed week summary (excludes current week)
 * Returns the summary for the previous week or older
 */
export const getLatestCompletedWeekSummary = <T extends { week_start: string }>(
  summaries: T[]
): T | null => {
  if (summaries.length === 0) return null;
  
  const currentWeekStart = getCurrentWeekStartString();
  
  // Filter out current week summaries and return the most recent completed week summary
  const completedSummaries = summaries.filter(
    summary => summary.week_start !== currentWeekStart
  );
  
  return completedSummaries.length > 0 ? completedSummaries[0] : null;
};

