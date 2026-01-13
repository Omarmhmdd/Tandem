import { useMemo } from 'react';
import { useWeeklyAnalytics, useMonthlyMoodAnalytics, usePantryWasteAnalytics, useBudgetCategoriesAnalytics } from '../api/queries/analytics';
import { useGoals } from '../api/queries/goals';
import { useBudgetSummary } from '../api/queries/budget';
import {transformWeeklyDataForChart,transformPantryWasteForChart,} from '../utils/transforms/analyticsTransforms';
import {calculateTotalSteps,calculateAverageSleep,calculateAverageMood,calculateGoalsProgress,calculateBudgetChartDomain,} from '../utils/analyticsHelpers';
import type { WeeklyChartData, PantryWasteChartData, UseAnalyticsParams } from '../types/analytics.types';

export const useAnalytics = ({timeRange,weekStart,weekEnd,monthStart,currentYear,currentMonth,}: UseAnalyticsParams) => {
  const analyticsStartDate = timeRange === 'week' ? weekStart : monthStart;
  const analyticsEndDate = timeRange === 'week' ? weekEnd : new Date().toISOString().split('T')[0];

  // Fetch analytics data
  const { data: weeklyAnalytics, isLoading: weeklyLoading } = useWeeklyAnalytics(
    analyticsStartDate,
    analyticsEndDate
  );
  const { data: monthlyMoodData, isLoading: moodLoading } = useMonthlyMoodAnalytics(
    currentYear,
    currentMonth
  );
  const { data: pantryWasteData, isLoading: pantryLoading } = usePantryWasteAnalytics(
    analyticsStartDate,
    analyticsEndDate
  );
  const { data: budgetCategoriesData, isLoading: budgetLoading } = useBudgetCategoriesAnalytics(
    currentYear,
    currentMonth
  );
  const { data: goals = [], isLoading: goalsLoading } = useGoals();
  const { data: budgetSummary } = useBudgetSummary(currentYear, currentMonth);

  // Transform data for charts
  const weeklyData = useMemo<WeeklyChartData[]>(() => {
    if (!weeklyAnalytics) return [];
    return transformWeeklyDataForChart(weeklyAnalytics, timeRange);
  }, [weeklyAnalytics, timeRange]);

  const pantryWasteChartData = useMemo<PantryWasteChartData[]>(() => {
    if (!pantryWasteData) return [];
    return transformPantryWasteForChart(pantryWasteData);
  }, [pantryWasteData]);

  // Calculate summary stats
  const totalSteps = useMemo(() => calculateTotalSteps(weeklyData), [weeklyData]);
  const avgSleep = useMemo(() => calculateAverageSleep(weeklyData), [weeklyData]);
  const avgMood = useMemo(() => calculateAverageMood(weeklyData), [weeklyData]);
  const goalsProgress = useMemo(() => calculateGoalsProgress(goals), [goals]);

  // Calculate budget chart domain
  const budgetChartDomain = useMemo(() => {
    const monthlyBudget = budgetSummary?.budget?.monthly_budget;
    return calculateBudgetChartDomain(
      budgetCategoriesData || [],
      monthlyBudget
    );
  }, [budgetCategoriesData, budgetSummary?.budget?.monthly_budget]);

  const isLoading = weeklyLoading || moodLoading || pantryLoading || budgetLoading || goalsLoading;

  return {
    weeklyData,
    monthlyMoodData: monthlyMoodData || [],
    pantryWasteChartData,
    budgetCategoriesData: budgetCategoriesData || [],
    budgetSummary,
    goals,
    totalSteps,
    avgSleep,
    avgMood,
    goalsProgress,
    budgetChartDomain,
    isLoading,
  };
};

