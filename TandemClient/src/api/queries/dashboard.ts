import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { useHasHousehold } from '../../hooks/useHasHousehold';
import { STALE_TIME_5_MIN } from '../../utils/constants';
import type { DashboardResponse as DashboardApiResponse } from '../../types/api.types';
import type { DashboardQueryData } from '../../types/Dashboard.types';
import { transformPantryItem } from '../../utils/transforms/pantryTransforms';
import { transformGoal } from '../../utils/transforms/goalTransforms';
import { transformHealthLog } from '../../utils/transforms/healthTransforms';
import { transformMealPlan } from '../../utils/transforms/mealTransforms';
import { transformMember } from '../../utils/transforms/householdTransforms';
import { transformWeeklySummary } from '../../utils/transforms/weeklySummaryTransforms';

export const useDashboard = () => {
  const hasHousehold = useHasHousehold();
  
  return useQuery<DashboardQueryData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await apiClient.get<DashboardApiResponse>(ENDPOINTS.DASHBOARD);
      
      const data = response.data;
      
      return {
        items: (data.items || []).map(transformPantryItem),
        goals: (data.goals || []).map(transformGoal),
        logs: (data.logs || []).map(transformHealthLog),
        plans: (data.plans || []).map(transformMealPlan),
        members: (data.members || []).map(transformMember),
        summaries: (data.summaries || []).map(transformWeeklySummary),
      };
    },
    enabled: hasHousehold,
    staleTime: STALE_TIME_5_MIN,
  });
};

