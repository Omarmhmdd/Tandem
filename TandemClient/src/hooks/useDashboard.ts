import { useMemo, useEffect, useRef } from 'react';
import { usePantryItems } from '../api/queries/pantry';
import { useGoals } from '../api/queries/goals';
import { useHealthLogs } from '../api/queries/health';
import { useMealPlans } from '../api/queries/meals';
import { useHouseholdMembers } from '../api/queries/household';
import { useWeeklySummaries, useGenerateWeeklySummary } from '../api/queries/weeklySummary';
import { useAuth } from '../contexts/AuthContext';
import { useHousehold } from '../contexts/HouseholdContext';
import { calculateDaysUntilExpiry } from '../utils/pantryHelpers';
import {isGoalCompleted,getWeekStart,calculateAverageSleep,getPartnerName,hasSummaryForPreviousWeek,getPreviousWeekStartString,getLatestCompletedWeekSummary,} from '../utils/dashboardHelpers';
import { EXPIRY_WARNING_DAYS, RECENT_LOGS_COUNT } from '../utils/constants';
import type { DashboardData } from '../types/Dashboard.types';


export const useDashboardPage = (): DashboardData => {
  const { user } = useAuth();
  const { household } = useHousehold();
  const { data: pantryItems = [], isLoading: isLoadingPantry } = usePantryItems();
  const { data: goals = [], isLoading: isLoadingGoals } = useGoals();
  const { data: healthLogs = [], isLoading: isLoadingHealthLogs } = useHealthLogs();
  const { data: mealPlans = [], isLoading: isLoadingMealPlans } = useMealPlans();
  const { data: members = [], isLoading: isLoadingMembers } = useHouseholdMembers(household?.id || '');
  const { data: weeklySummaries = [], isLoading: isLoadingSummaries } = useWeeklySummaries();
  const generateSummary = useGenerateWeeklySummary();
  const isGeneratingRef = useRef(false);
  const lastCheckedWeekRef = useRef<string | null>(null);

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

  // Page-level loading state: any of the core queries still loading
  const isLoading =
    isLoadingPantry ||
    isLoadingGoals ||
    isLoadingHealthLogs ||
    isLoadingMealPlans ||
    isLoadingMembers ||
    isLoadingSummaries;

  // Auto-generate summary for previous completed week if it doesn't exist
  useEffect(() => {
    // Only run if:
    // 1. We have a household
    // 2. Summaries have finished loading (not loading anymore)
    // 3. We're not currently generating
    if (
      !household?.id ||
      isLoadingSummaries ||
      isGeneratingRef.current ||
      generateSummary.isPending
    ) {
      return;
    }

    const previousWeekStart = getPreviousWeekStartString();
    const lastCheckedWeek = lastCheckedWeekRef.current;

    // Check if we need to generate a summary for the previous completed week
    const needsGeneration = !hasSummaryForPreviousWeek(weeklySummaries);

    // Skip if we already checked this previous week AND a summary exists
    if (lastCheckedWeek === previousWeekStart) {
      const hasPreviousWeekSummary = hasSummaryForPreviousWeek(weeklySummaries);
      if (hasPreviousWeekSummary) {
        return; // Already have summary for previous week, no need to check again
      }
      // If we checked but no summary exists, it means generation failed - try again
    }

    if (needsGeneration) {
      // Mark that we're generating to prevent duplicate calls
      isGeneratingRef.current = true;

      // Generate summary for previous week (no weekStart param = backend uses previous week)
      generateSummary.mutate(undefined, {
        onSuccess: () => {
          // Mark this previous week as checked only on success
          lastCheckedWeekRef.current = previousWeekStart;
          isGeneratingRef.current = false;
        },
        onError: (error) => {
          // Silently handle errors - don't show to user, just log
          console.error('Failed to auto-generate weekly summary:', error);
          // Don't mark as checked on error - we'll try again
          isGeneratingRef.current = false;
        },
      });
    } else {
      // Summary exists, mark this previous week as checked
      lastCheckedWeekRef.current = previousWeekStart;
    }
  }, [
    household?.id,
    isLoadingSummaries,
    weeklySummaries,
    generateSummary,
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