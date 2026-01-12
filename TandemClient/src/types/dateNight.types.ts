export interface DateNightSuggestion {
  meal: {
    name: string;
    description: string;
    cost: number;
    recipeId?: number;
    usesPantry?: boolean;
  };
  activity: {
    name: string;
    description: string;
    duration: string;
    cost: number;
    location?: 'home' | 'outdoor' | 'venue';
  };
  treat: {
    name: string;
    description: string;
    cost: number;
  };
  totalCost: number;
  reasoning: string;
  status?: 'pending' | 'accepted' | 'declined';
  id?: string | number;
}

