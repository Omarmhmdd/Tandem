import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { WeeklySummary, WeeklySummariesResponse, SingleWeeklySummaryResponse } from '../../types/weeklySummary.types';
import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { useHasHousehold } from '../../hooks/useHasHousehold';
import { STALE_TIME_10_MIN } from '../../utils/constants';
import { transformWeeklySummary } from '../../utils/transforms/weeklySummaryTransforms';

export const useWeeklySummaries = () => {
  const hasHousehold = useHasHousehold();
  
  return useQuery<WeeklySummary[]>({
    queryKey: ['weeklySummaries'],
    queryFn: async () => {
      const response = await apiClient.get<WeeklySummariesResponse>(
        ENDPOINTS.WEEKLY_SUMMARIES
      );
      const summaries = response.data.summaries || [];
      return summaries.map(transformWeeklySummary);
    },
    enabled: hasHousehold,
    staleTime: STALE_TIME_10_MIN,
  });
};

export const useGenerateWeeklySummary = () => {
  const queryClient = useQueryClient();

  return useMutation<WeeklySummary, Error, string | undefined>({
    mutationFn: async (weekStart?: string) => {
      const response = await apiClient.post<SingleWeeklySummaryResponse>(
        ENDPOINTS.WEEKLY_SUMMARIES,
        weekStart ? { week_start: weekStart } : {}
      );
      return transformWeeklySummary(response.data.summary);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklySummaries'] });
    },
  });
};