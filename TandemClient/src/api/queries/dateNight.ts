import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { DateNightSuggestionsResponse, SingleDateNightResponse } from '../../types/api.types';
import type { DateNightSuggestion } from '../../types/dateNight.types';
import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { useHasHousehold } from '../../hooks/useHasHousehold';
import { transformDateNightSuggestion, transformDateNightSuggestionToBackend } from '../../utils/transforms/dateNightTransforms';

export const useDateNightSuggestions = () => {
  const hasHousehold = useHasHousehold();
  
  return useQuery<DateNightSuggestion[]>({
    queryKey: ['dateNightSuggestions'],
    queryFn: async () => {
      const response = await apiClient.get<DateNightSuggestionsResponse>(ENDPOINTS.DATE_NIGHT);
      const suggestions = response.data.suggestions || [];
      return suggestions.map(transformDateNightSuggestion);
    },
    enabled: hasHousehold, // Only fetch if household exists
    staleTime: 1000 * 60 * 5,
  });
};

export const useGenerateDateNight = () => {
  const queryClient = useQueryClient();

  return useMutation<DateNightSuggestion, Error, { suggestedAt?: string; budget?: number }>({
    mutationFn: async ({ suggestedAt, budget }) => {
      const backendData = transformDateNightSuggestionToBackend({totalCost: budget,});
      
      const response = await apiClient.post<SingleDateNightResponse>(ENDPOINTS.DATE_NIGHT,{
          suggested_at: suggestedAt || backendData.suggested_at,
          budget: budget || backendData.budget,});

      return transformDateNightSuggestion(response.data.suggestion);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dateNightSuggestions'] });
    },
  });
};

export const useAcceptDateNight = () => {
  const queryClient = useQueryClient();

  return useMutation<DateNightSuggestion, Error, string | number>({
    mutationFn: async (suggestionId) => {
      const response = await apiClient.post<SingleDateNightResponse>(ENDPOINTS.DATE_NIGHT_ACCEPT(suggestionId.toString()));
      return transformDateNightSuggestion(response.data.suggestion);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dateNightSuggestions'] });
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['budgetSummary'] });
    },
  });
};

