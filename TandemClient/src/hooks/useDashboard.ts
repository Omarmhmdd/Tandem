import { useMemo } from 'react';
import { usePantryItems } from '../api/queries/pantry';
import { useGoals } from '../api/queries/goals';
import { useHealthLogs } from '../api/queries/health';
import { useMealPlans } from '../api/queries/meals';
import { useHouseholdMembers } from '../api/queries/household';
import { useWeeklySummaries } from '../api/queries/weeklySummary';
import { useAuth } from '../contexts/AuthContext';
import { useHousehold } from '../contexts/HouseholdContext';
import { calculateDaysUntilExpiry } from '../utils/pantryHelpers';
import {isGoalCompleted,getWeekStart,calculateAverageSleep,getPartnerName,} from '../utils/dashboardHelpers';
import { EXPIRY_WARNING_DAYS, RECENT_LOGS_COUNT } from '../utils/constants';
import type { DashboardData } from '../types/Dashboard.types';


export const useDashboardPage = (): DashboardData => {
  const { user } = useAuth();
  const { household } = useHousehold();
  const { data: pantryItems = [] } = usePantryItems();
  const { data: goals = [] } = useGoals();
  const { data: healthLogs = [] } = useHealthLogs();
  const { data: mealPlans = [] } = useMealPlans();
  const { data: members = [] } = useHouseholdMembers(household?.id || '');
  const { data: weeklySummaries = [] } = useWeeklySummaries();

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
    return healthLogs.slice(-RECENT_LOGS_COUNT);
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
    return weeklySummaries.length > 0 ? weeklySummaries[0] : null;
  }, [weeklySummaries]);

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
  };
};