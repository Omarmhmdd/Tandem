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
  if (weeklyData.length === 0) return 0;
  
  let total = 0;
  for (let i = 0; i < weeklyData.length; i++) {
    const day = weeklyData[i];
    total += (day.me || 0) + (day.partner || 0);
  }
  return total;
};


export const calculateAverageSleep = (
  weeklyData: WeeklyChartData[]
): string => {
  if (weeklyData.length === 0) return '0';
  
  let sum = 0;
  let count = 0;
  
  for (let i = 0; i < weeklyData.length; i++) {
    const sleep = weeklyData[i].sleep;
    if (sleep !== null && sleep !== undefined && sleep > 0) {
      sum += sleep;
      count++;
    }
  }
  
  if (count === 0) return '0';
  return (sum / count).toFixed(1);
};


export const calculateAverageMood = (
  weeklyData: WeeklyChartData[]
): string => {
  if (weeklyData.length === 0) return '0';
  
  let sum = 0;
  let count = 0;
  
  for (let i = 0; i < weeklyData.length; i++) {
    const mood = weeklyData[i].mood;
    if (mood !== null && mood !== undefined && mood > 0) {
      sum += mood;
      count++;
    }
  }
  
  if (count === 0) return '0';
  return (sum / count).toFixed(1);
};


export const calculateGoalsProgress = (
  goals: Array<{ current: number; target: number }>
): number => {
  if (goals.length === 0) return 0;
  
  let totalProgress = 0;
  for (let i = 0; i < goals.length; i++) {
    const goal = goals[i];
    const progress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
    totalProgress += Math.min(progress, 100);
  }
  
  return Math.round(totalProgress / goals.length);
};


export const calculateBudgetChartDomain = (
  budgetCategories: BudgetCategory[],monthlyBudget: number | string | undefined): number | 'auto' => {
  if (!monthlyBudget) return 'auto';
  
  const budgetValue = typeof monthlyBudget === 'string' 
    ? parseFloat(monthlyBudget) 
    : monthlyBudget;
  
  if (isNaN(budgetValue)) return 'auto';
  
  // Find max category amount - optimized single pass
  let maxCategoryAmount = 0;
  for (let i = 0; i < budgetCategories.length; i++) {
    const amount = budgetCategories[i].amount || 0;
    if (amount > maxCategoryAmount) {
      maxCategoryAmount = amount;
    }
  }
  
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

