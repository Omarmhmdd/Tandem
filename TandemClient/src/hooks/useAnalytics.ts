import { useMemo, useDeferredValue } from 'react';
import { useAnalyticsAggregated } from '../api/queries/analytics';
import {transformWeeklyDataForChart,transformPantryWasteForChart,} from '../utils/transforms/analyticsTransforms';
import {calculateTotalSteps,calculateAverageSleep,calculateAverageMood,calculateGoalsProgress,calculateBudgetChartDomain,} from '../utils/analyticsHelpers';
import type { WeeklyChartData, PantryWasteChartData, UseAnalyticsParams } from '../types/analytics.types';

export const useAnalytics = ({timeRange,weekStart,weekEnd,monthStart,currentYear,currentMonth,}: UseAnalyticsParams) => {
  // Fetch all analytics data in a single aggregated call
  const { data: aggregatedData, isLoading } = useAnalyticsAggregated({
    timeRange,
    weekStart,
    weekEnd,
    monthStart,
    currentYear,
    currentMonth,
  });

  // Use deferred value to prevent blocking main thread during heavy calculations
  // This allows React to prioritize urgent updates (like user interactions)
  // The deferred value will update after urgent updates are processed
  const deferredData = useDeferredValue(aggregatedData);
  const isPending = deferredData !== aggregatedData;

  // Extract data from aggregated response - use deferred for heavy calculations
  const weeklyAnalytics = deferredData?.weekly;
  const monthlyMoodData = deferredData?.monthlyMood || [];
  const pantryWasteData = deferredData?.pantryWaste;
  const budgetCategoriesData = deferredData?.budgetCategories || [];
  const goals = deferredData?.goals || [];
  const budgetSummary = deferredData?.budgetSummary;

  // Transform data for charts - these are heavy operations, deferred to prevent blocking
  const weeklyData = useMemo<WeeklyChartData[]>(() => {
    if (!weeklyAnalytics) return [];
    return transformWeeklyDataForChart(weeklyAnalytics, timeRange);
  }, [weeklyAnalytics, timeRange]);

  const pantryWasteChartData = useMemo<PantryWasteChartData[]>(() => {
    if (!pantryWasteData) return [];
    return transformPantryWasteForChart(pantryWasteData);
  }, [pantryWasteData]);

  // Calculate summary stats - deferred to prevent blocking
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

  return {
    weeklyData,
    monthlyMoodData,
    pantryWasteChartData,
    budgetCategoriesData,
    budgetSummary,
    goals,
    totalSteps,
    avgSleep,
    avgMood,
    goalsProgress,
    budgetChartDomain,
    isLoading: isLoading || isPending, // Show loading while data is being processed
  };
};

