import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { DateNightSuggestionsResponse, SingleDateNightResponse } from '../../types/api.types';
import type { DateNightSuggestion } from '../../types/dateNight.types';
import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { useHasHousehold } from '../../hooks/useHasHousehold';
import { transformDateNightSuggestion, transformDateNightSuggestionToBackend } from '../../utils/transforms/dateNightTransforms';

export const useDateNightSuggestions = () => {
  const hasHousehold = useHasHousehold();
  
  return useQuery<{ suggestions: DateNightSuggestion[]; acceptedDateNights: DateNightSuggestion[] }>({
    queryKey: ['dateNightSuggestions'],
    queryFn: async () => {
      const response = await apiClient.get<DateNightSuggestionsResponse>(ENDPOINTS.DATE_NIGHT);
      const suggestions = (response.data.suggestions || []).map(transformDateNightSuggestion);
      const acceptedDateNights = (response.data.accepted_date_nights || []).map(transformDateNightSuggestion);
      return { suggestions, acceptedDateNights };
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

  return useMutation<DateNightSuggestion, Error, { suggestionId: string | number; date: string }>({
    mutationFn: async ({ suggestionId, date }) => {
      const response = await apiClient.post<SingleDateNightResponse>(
        ENDPOINTS.DATE_NIGHT_ACCEPT(suggestionId.toString()),
        { date }
      );
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

