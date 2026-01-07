import type { PantryItem } from './pantry.types';
import type { LogEntry } from './health.types';
import type { WeeklySummary } from './weeklySummary.types';

/**
 * Dashboard data return type
 */
export interface DashboardData {
  pantryItems: PantryItem[];
  expiringItems: PantryItem[];
  totalGoals: number;
  completedGoals: number;
  recentLogs: LogEntry[];
  avgSleep: string;
  thisWeekMeals: number;
  partnerName: string | null;
  latestSummary: WeeklySummary | null;
}

