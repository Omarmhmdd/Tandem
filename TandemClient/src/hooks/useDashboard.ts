import { useMemo, useEffect, useRef } from 'react';
import { useDashboard } from '../api/queries/dashboard';
import { useGenerateWeeklySummary } from '../api/queries/weeklySummary';
import { useAuth } from '../contexts/AuthContext';
import { useHousehold } from '../contexts/HouseholdContext';
import { calculateDaysUntilExpiry } from '../utils/pantryHelpers';
import {isGoalCompleted,getWeekStart,calculateAverageSleep,getPartnerName,hasSummaryForPreviousWeek,getPreviousWeekStartString,getLatestCompletedWeekSummary,} from '../utils/dashboardHelpers';
import { EXPIRY_WARNING_DAYS, RECENT_LOGS_COUNT } from '../utils/constants';
import type { DashboardData } from '../types/Dashboard.types';


export const useDashboardPage = (): DashboardData => {
  const { user } = useAuth();
  const { household } = useHousehold();
  const { data: dashboardData, isLoading } = useDashboard();
  const generateSummary = useGenerateWeeklySummary();
  const isGeneratingRef = useRef(false);
  const lastCheckedWeekRef = useRef<string | null>(null);

  // Extract data from aggregated response
  const pantryItems = dashboardData?.items || [];
  const goals = dashboardData?.goals || [];
  const healthLogs = dashboardData?.logs || [];
  const mealPlans = dashboardData?.plans || [];
  const members = dashboardData?.members || [];
  const weeklySummaries = dashboardData?.summaries || [];

  const expiringItems = useMemo(() => {
    return pantryItems.filter((item) => {
      const days = calculateDaysUntilExpiry(item.expiry);
      return days <= EXPIRY_WARNING_DAYS && days >= 0;
    });
  }, [pantryItems]);

  const completedGoals = useMemo(() => {
    return goals.filter(isGoalCompleted).length;
  }, [goals]);

  const recentLogs = useMemo(() => {
    // Backend returns logs sorted by date DESC (most recent first)
    // So we take the FIRST N items, not the last N
    return healthLogs.slice(0, RECENT_LOGS_COUNT);
  }, [healthLogs]);

  const avgSleep = useMemo(() => {
    return calculateAverageSleep(healthLogs);
  }, [healthLogs]);

  const thisWeekMeals = useMemo(() => {
    const weekStart = getWeekStart();
    return mealPlans.filter((meal) => {
      const mealDate = new Date(meal.date);
      mealDate.setHours(0, 0, 0, 0);
      return mealDate >= weekStart;
    }).length;
  }, [mealPlans]);

  const partnerName = useMemo(() => {
    return getPartnerName(user?.id, members);
  }, [user?.id, members]);

  const latestSummary = useMemo(() => {
    // Only show summaries for completed weeks (exclude current week)
    return getLatestCompletedWeekSummary(weeklySummaries);
  }, [weeklySummaries]);

  // Auto-generate summary for previous completed week if it doesn't exist
  useEffect(() => {
    // Only run if:
    // 1. We have a household
    // 2. Dashboard data has finished loading (not loading anymore)
    // 3. We're not currently generating
    if (
      !household?.id ||
      isLoading ||
      isGeneratingRef.current ||
      generateSummary.isPending
    ) {
      return;
    }

    const previousWeekStart = getPreviousWeekStartString();
    const lastCheckedWeek = lastCheckedWeekRef.current;

    // Skip if we already checked this previous week (prevents infinite loops)
    if (lastCheckedWeek === previousWeekStart) {
      return;
    }

    // Check if we need to generate a summary for the previous completed week
    const needsGeneration = !hasSummaryForPreviousWeek(weeklySummaries);

    if (needsGeneration) {
      // Mark that we're generating AND mark this week as checked to prevent re-runs
      isGeneratingRef.current = true;
      lastCheckedWeekRef.current = previousWeekStart;

      // Generate summary for previous week (no weekStart param = backend uses previous week)
      generateSummary.mutate(undefined, {
        onSuccess: () => {
          // Keep the ref marked as checked on success
          isGeneratingRef.current = false;
        },
        onError: (error) => {
          // Silently handle errors - don't show to user, just log
          console.error('Failed to auto-generate weekly summary:', error);
          // Reset refs on error so we can try again on next render
          isGeneratingRef.current = false;
          lastCheckedWeekRef.current = null;
        },
      });
    } else {
      // Summary exists, mark this previous week as checked
      lastCheckedWeekRef.current = previousWeekStart;
    }
  }, [
    household?.id,
    isLoading,
    weeklySummaries,
    generateSummary.isPending,
    generateSummary.mutate,
  ]);

  return {
    pantryItems,
    expiringItems,
    totalGoals: goals.length,
    completedGoals,
    recentLogs,
    avgSleep,
    thisWeekMeals,
    partnerName,
    latestSummary,
    isLoading,
  };
};