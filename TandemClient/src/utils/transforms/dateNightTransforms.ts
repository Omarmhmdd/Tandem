import type { DateNightSuggestion } from '../../types/dateNight.types';
import type { BackendDateNightSuggestion } from '../../types/api.types';
import { formatDateForAPI } from '../dateHelpers';


export const transformDateNightSuggestion = (
  suggestion: BackendDateNightSuggestion): DateNightSuggestion => ({
  id: String(suggestion.id),
  meal: {
    name: suggestion.meal.name,
    description: suggestion.meal.description,
    cost: typeof suggestion.meal.cost === 'string' 
      ? parseFloat(suggestion.meal.cost) 
      : suggestion.meal.cost,
    recipeId: suggestion.meal.recipeId,
    usesPantry: suggestion.meal.usesPantry,
  },
  activity: {
    name: suggestion.activity.name,
    description: suggestion.activity.description,
    duration: suggestion.activity.duration,
    cost: typeof suggestion.activity.cost === 'string'
      ? parseFloat(suggestion.activity.cost)
      : suggestion.activity.cost,
    location: suggestion.activity.location,
  },
  treat: {
    name: suggestion.treat.name,
    description: suggestion.treat.description,
    cost: typeof suggestion.treat.cost === 'string'
      ? parseFloat(suggestion.treat.cost)
      : suggestion.treat.cost,
  },
  totalCost: typeof suggestion.total_cost === 'string'
    ? parseFloat(suggestion.total_cost)
    : suggestion.total_cost,
  reasoning: suggestion.reasoning,
  status: suggestion.status || 'pending',
  suggestedAt: suggestion.suggested_at,
});


export const transformDateNightSuggestionToBackend = (suggestion: Partial<DateNightSuggestion>): {
  suggested_at?: string;
  budget?: number;
} => ({
  suggested_at: suggestion.id ? undefined : formatDateForAPI(),
  budget: suggestion.totalCost,
});

