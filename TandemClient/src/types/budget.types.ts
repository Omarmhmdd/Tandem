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

