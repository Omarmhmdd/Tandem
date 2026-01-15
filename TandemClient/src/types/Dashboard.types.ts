import type { PantryItem } from './pantry.types';
import type { LogEntry } from './health.types';
import type { WeeklySummary } from './weeklySummary.types';
import type { Goal } from './goal.types';
import type { MealSlot } from './meal.types';
import type { HouseholdMember } from './household.type';

export interface DashboardQueryData {
  items: PantryItem[];
  goals: Goal[];
  logs: LogEntry[];
  plans: MealSlot[];
  members: HouseholdMember[];
  summaries: WeeklySummary[];
}

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
  isLoading: boolean;
}

