export interface Expense {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: 'groceries' | 'dining' | 'wedding' | 'health' | 'big-ticket' | 'other';
  autoTagged?: boolean;
  userId?: string;
}

export interface BudgetSummary {
  monthlyBudget: number;
  spent: number;
  remaining: number;
  byCategory: Record<string, number>;
}

export interface ExpenseFormData {
  date: string;
  amount: number;
  description: string;
  category: 'groceries' | 'dining' | 'wedding' | 'health' | 'big-ticket' | 'other';
}

// Aggregated Budget Data (after transformation)
export interface BudgetAggregatedData {
  expenses: Expense[];
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
export interface UseBudgetAggregatedParams {
  startDate?: string;
  endDate?: string;
  year?: number;
  month?: number;
}

