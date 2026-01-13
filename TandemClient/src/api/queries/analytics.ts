import { useQuery } from '@tanstack/react-query';
import type {WeeklyAnalytics,MonthlyMood,PantryWaste,BudgetCategory,WeeklyAnalyticsResponse,MonthlyMoodAnalyticsResponse,PantryWasteAnalyticsResponse,BudgetCategoriesAnalyticsResponse,} from '../../types/analytics.types';
import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { useHasHousehold } from '../../hooks/useHasHousehold';
import {transformWeeklyAnalytics,transformMonthlyMood,transformPantryWaste,transformBudgetCategory,} from '../../utils/transforms/analyticsTransforms';
import { buildAnalyticsQueryString } from '../../utils/analyticsHelpers';

export const useWeeklyAnalytics = (startDate?: string, endDate?: string) => {
  const hasHousehold = useHasHousehold();
  
  return useQuery<WeeklyAnalytics>({
    queryKey: ['analytics', 'weekly', startDate, endDate],
    queryFn: async () => {
      const query = buildAnalyticsQueryString({ startDate, endDate });
      
      const response = await apiClient.get<WeeklyAnalyticsResponse>(
        `${ENDPOINTS.ANALYTICS_WEEKLY}${query ? `?${query}` : ''}`
      );
      
      // Backend returns: { data: { steps: [], sleep: [], mood: [] } }
      // apiClient.get returns the response directly, so response.data is the BackendWeeklyAnalytics
      const backendData = response.data || {
        steps: [],
        sleep: [],
        mood: [],
      };
      
      return transformWeeklyAnalytics(backendData);
    },
    enabled: hasHousehold,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};

export const useMonthlyMoodAnalytics = (year?: number, month?: number) => {
  const hasHousehold = useHasHousehold();
  
  return useQuery<MonthlyMood[]>({
    queryKey: ['analytics', 'monthly-mood', year, month],
    queryFn: async () => {
      const query = buildAnalyticsQueryString({ year, month });
      
      const response = await apiClient.get<MonthlyMoodAnalyticsResponse>(
        `${ENDPOINTS.ANALYTICS_MONTHLY_MOOD}${query ? `?${query}` : ''}`
      );
      
      // Backend returns: { data: { mood: [...] } }
      // apiClient.get returns the response directly, so response.data.mood is the array
      const backendData = response.data?.mood || [];
      return transformMonthlyMood(backendData);
    },
    enabled: hasHousehold,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};

export const usePantryWasteAnalytics = (startDate?: string, endDate?: string) => {
  const hasHousehold = useHasHousehold();
  
  return useQuery<PantryWaste>({
    queryKey: ['analytics', 'pantry-waste', startDate, endDate],
    queryFn: async () => {
      const query = buildAnalyticsQueryString({ startDate, endDate });
      
      const response = await apiClient.get<PantryWasteAnalyticsResponse>(
        `${ENDPOINTS.ANALYTICS_PANTRY_WASTE}${query ? `?${query}` : ''}`
      );
      
      // Backend returns: { data: { used: ..., wasted: ..., donated: ... } }
      // apiClient.get returns the response directly, so response.data is the BackendPantryWaste
      const backendData = response.data || {
        used: 0,
        wasted: 0,
        donated: 0,
        total_items: 0,
      };
      
      return transformPantryWaste(backendData);
    },
    enabled: hasHousehold,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};

export const useBudgetCategoriesAnalytics = (year?: number, month?: number) => {
  const hasHousehold = useHasHousehold();
  
  return useQuery<BudgetCategory[]>({
    queryKey: ['analytics', 'budget-categories', year, month],
    queryFn: async () => {
      const query = buildAnalyticsQueryString({ year, month });
      
      const response = await apiClient.get<BudgetCategoriesAnalyticsResponse>(
        `${ENDPOINTS.ANALYTICS_BUDGET_CATEGORIES}${query ? `?${query}` : ''}`
      );
      
      // Backend returns: { data: { categories: [...] } }
      // apiClient.get returns the response directly, so response.data.categories is the array
      const backendData = response.data?.categories || [];
      return transformBudgetCategory(backendData);
    },
    enabled: hasHousehold,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};

