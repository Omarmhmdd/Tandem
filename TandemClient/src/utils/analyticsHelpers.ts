import type { WeeklyChartData, BudgetCategory, DateRange } from '../types/analytics.types';


export const calculateAnalyticsDateRange = (): DateRange => {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6); // Sunday

  return {
    weekStart: weekStart.toISOString().split('T')[0],
    weekEnd: weekEnd.toISOString().split('T')[0],
    monthStart: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    currentYear: now.getFullYear(),
    currentMonth: now.getMonth() + 1,
  };
};


export const formatMonthlyBudget = (
  monthlyBudget: number | string | undefined
): number | undefined => {
  if (!monthlyBudget) return undefined;
  return typeof monthlyBudget === 'string' ? parseFloat(monthlyBudget) : monthlyBudget;
};


export const calculateTotalSteps = (weeklyData: WeeklyChartData[]): number => {
  return weeklyData.reduce(
    (sum, day) => sum + (day.me || 0) + (day.partner || 0),
    0
  );
};


export const calculateAverageSleep = (
  weeklyData: WeeklyChartData[]
): string => {
  const sleepValues = weeklyData
    .map((d) => d.sleep)
    .filter((s): s is number => s != null && s > 0);
  
  if (sleepValues.length === 0) return '0';
  
  const average =
    sleepValues.reduce((sum, s) => sum + s, 0) / sleepValues.length;
  return average.toFixed(1);
};


export const calculateAverageMood = (
  weeklyData: WeeklyChartData[]
): string => {
  const moodValues = weeklyData
    .map((d) => d.mood)
    .filter((m): m is number => m != null && m > 0);
  
  if (moodValues.length === 0) return '0';
  
  const average =
    moodValues.reduce((sum, m) => sum + m, 0) / moodValues.length;
  return average.toFixed(1);
};


export const calculateGoalsProgress = (
  goals: Array<{ current: number; target: number }>
): number => {
  if (goals.length === 0) return 0;
  
  const totalProgress = goals.reduce((sum, goal) => {
    const progress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
    return sum + Math.min(progress, 100);
  }, 0);
  
  return Math.round(totalProgress / goals.length);
};


export const calculateBudgetChartDomain = (
  budgetCategories: BudgetCategory[],monthlyBudget: number | string | undefined): number | 'auto' => {
  if (!monthlyBudget) return 'auto';
  
  const budgetValue = typeof monthlyBudget === 'string' 
    ? parseFloat(monthlyBudget) 
    : monthlyBudget;
  
  if (isNaN(budgetValue)) return 'auto';
  
  const maxCategoryAmount = Math.max(...budgetCategories.map((d) => d.amount || 0),0);
  
  return Math.max(maxCategoryAmount, budgetValue) * 1.1;
};


export const formatCurrency = (value: number): string => {
  return `$${value.toLocaleString()}`;
};


export const formatPercentage = (percent: number | undefined): string => {
  if (percent === undefined) return '0%';
  return `${(percent * 100).toFixed(0)}%`;
};


export const buildAnalyticsQueryString = (params: 
  {startDate?: string;endDate?: string;year?: number;month?: number;}): string => {
  const urlParams = new URLSearchParams();
  if (params.startDate) urlParams.append('start_date', params.startDate);
  if (params.endDate) urlParams.append('end_date', params.endDate);
  if (params.year) urlParams.append('year', params.year.toString());
  if (params.month) urlParams.append('month', params.month.toString());
  return urlParams.toString();
};

