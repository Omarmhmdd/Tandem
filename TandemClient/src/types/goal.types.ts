

// Frontend types (camelCase)
export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  deadline?: string;
}

export interface Goal {
  id: string;
  title: string;
  category: 'wedding' | 'health' | 'financial' | 'other';
  target: number;
  current: number;
  unit: string;
  deadline?: string;
  completed_at?: string;
  milestones: Milestone[];
}

export interface GoalFormData {
  title: string;
  category: 'wedding' | 'health' | 'financial' | 'other';
  target: number;
  current: number;
  unit: string;
  deadline?: string;
  milestones: Milestone[];
}

export interface GoalCompletionStatus {
  isComplete: boolean;
  progress: number;
  allMilestonesComplete: boolean;
  hasMilestones: boolean;
  canReachGoal: boolean;
}

// Backend types (snake_case from API)
export interface BackendMilestone {
  id: number | string;
  goal_id?: number | string;
  title: string;
  completed: boolean;
  deadline?: string;
  order?: number;
}

export interface BackendGoal {
  id: number | string;
  title: string;
  category: string;
  target: number;
  current: number;
  unit: string;
  deadline?: string;
  completed_at?: string;
  milestones?: BackendMilestone[];
}

// API Response types
export interface GoalsResponse {
  data: {
    goals: BackendGoal[];
  };
  message?: string;
}

export interface SingleGoalResponse {
  data: {
    goal: BackendGoal;
  };
  message?: string;
}

// Milestone API Response types
export interface MilestoneResponse {
  data: {
    milestone: BackendMilestone;
  };
  message?: string;
}

// Aggregated Goals Data (after transformation)
export interface GoalsAggregatedData {
  goals: Goal[];
  budgetSummary: {
    budget: {
      id?: number | string;
      household_id?: number;
      year?: number;
      month?: number;
      monthly_budget: number | string;
      created_at?: string;
      updated_at?: string;
    } | null;
    total_expenses: number;
    remaining: number | null;
  };
}

// Hook parameters
export interface UseGoalsAggregatedParams {
  year?: number;
  month?: number;
}


