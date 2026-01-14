// Frontend types (camelCase)
export interface WeeklyAnalytics {
  steps: DayData[];
  sleep: SleepData[];
  mood: DayData[];
  totalSteps: number;
  avgSleep: number;
  avgMood: number;
}

export interface DayData {
  day: string;
  me: number;
  partner: number;
}

export interface SleepData {
  day: string;
  hours: number | null;
}

export interface MonthlyMood {
  month: string;
  me: number;
  partner: number;
}

export interface PantryWaste {
  active: number;
  expiring_soon: number;
  deleted: number;
  totalItems?: number;
}

export interface BudgetCategory {
  category: string;
  amount: number;
  budget: number;
}

export interface WeeklyChartData {
  day: string;
  me: number;
  partner: number;
  sleep: number | null;
  mood: number | null;
}

export interface PantryWasteChartData {
  name: string;
  value: number;
  color: string;
}

// Backend types (snake_case from API)
export interface BackendWeeklyAnalytics {
  steps: Array<{
    day: string;
    me: number;
    partner: number;
  }>;
  sleep: Array<{day: string;hours: number | null;}>;
  mood: Array<{day: string;me: number;partner: number;}>;
  total_steps?: number;
  avg_sleep?: number;
  avg_mood?: number;
}

export interface BackendMonthlyMood {
  month: string;
  me: number;
  partner: number;
}

export interface BackendPantryWaste {
  active: number;
  expiring_soon: number;
  deleted: number;
  total_items?: number;
}

export interface BackendBudgetCategory {
  category: string;
  amount: number;
  budget: number;
}

// API Response types
export interface WeeklyAnalyticsResponse {
  data: BackendWeeklyAnalytics;
  message?: string;
}

export interface MonthlyMoodAnalyticsResponse {
  data: {
    mood: BackendMonthlyMood[];
  };
  message?: string;
}

export interface PantryWasteAnalyticsResponse {
  data: BackendPantryWaste;
  message?: string;
}

export interface BudgetCategoriesAnalyticsResponse {
  data: {
    categories: BackendBudgetCategory[];
  };
  message?: string;
}

// Hook parameter types
export interface UseAnalyticsParams {
  timeRange: 'week' | 'month';
  weekStart: string;
  weekEnd: string;
  monthStart: string;
  currentYear: number;
  currentMonth: number;
}

// Date range calculation result
export interface DateRange {
  weekStart: string;
  weekEnd: string;
  monthStart: string;
  currentYear: number;
  currentMonth: number;
}

// Backend Budget Summary (from API)
export interface BackendBudgetSummary {
  budget: {
    id: number | string;
    household_id: number;
    year: number;
    month: number;
    monthly_budget: string | number;
    created_by_user_id: number | string;
    updated_by_user_id: number | string;
    created_at: string;
    updated_at: string;
  } | null;
  total_expenses: number;
  remaining: number | null;
}

// Aggregated Analytics Response Types
export interface BackendAnalyticsAggregated {
  weekly: BackendWeeklyAnalytics;
  monthly_mood: BackendMonthlyMood[];
  pantry_waste: BackendPantryWaste;
  budget_categories: BackendBudgetCategory[];
  goals: import('./goal.types').BackendGoal[];
  budget_summary: BackendBudgetSummary;
}

export interface AnalyticsAggregatedResponse {
  data: BackendAnalyticsAggregated;
  message?: string;
}

import type { Goal } from './goal.types';

export interface AnalyticsAggregatedData {
  weekly: WeeklyAnalytics;
  monthlyMood: MonthlyMood[];
  pantryWaste: PantryWaste;
  budgetCategories: BudgetCategory[];
  goals: Goal[];
  budgetSummary: BackendBudgetSummary;
}

