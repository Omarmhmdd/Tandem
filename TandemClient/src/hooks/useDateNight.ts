import { useState } from 'react';
import { useGenerateDateNight, useAcceptDateNight } from '../api/queries/dateNight';
import type { DateNightSuggestion } from '../types/dateNight.types';
import { showToast } from '../utils/toast';
import { isValidDateNightBudget } from '../utils/dateNightHelpers';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export const useDateNightPage = () => {
  const [budget, setBudget] = useState(50);
  const [suggestion, setSuggestion] = useState<DateNightSuggestion | null>(null);
  const generateMutation = useGenerateDateNight();
  const acceptMutation = useAcceptDateNight();

  const generateSuggestion = async () => {
    if (!isValidDateNightBudget(budget)) return;

    try {
      const result = await generateMutation.mutateAsync({budget: budget,});
      setSuggestion(result);
    } catch (error) {
      console.error('Failed to generate date night suggestion:', error);
      showToast('Failed to generate suggestion', 'error');
    }
  };

  const acceptSuggestion = async () => {
    if (!suggestion || !suggestion.id) {
      showToast('No suggestion to accept', 'error');
      return;
    }

    if (suggestion.status === 'accepted') {
      showToast('This suggestion has already been accepted', 'info');
      return;
    }

    try {
      const result = await acceptMutation.mutateAsync(suggestion.id);
      setSuggestion(result);
      showToast('Date night accepted! Meal added to meal plan and expense recorded.', 'success');
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Failed to accept date night suggestion:', error);
      showToast(
        apiError?.response?.data?.message || apiError?.message || 'Failed to accept suggestion',
        'error'
      );
    }
  };

  return {
    budget,
    setBudget,
    suggestion,
    isLoading: generateMutation.isPending,
    isAccepting: acceptMutation.isPending,
    generateSuggestion,
    acceptSuggestion,
  };
};


