import type { Expense, BudgetAggregatedData } from '../../types/budget.types';
import type { BackendExpense, BudgetAggregatedResponse } from '../../types/api.types';


export const transformExpense = (expense: BackendExpense): Expense => ({
  id: String(expense.id),
  date: expense.date,
  amount: typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount,
  description: expense.description,
  category: expense.category,
  autoTagged: expense.auto_tagged ?? false,
  userId: expense.user_id ? String(expense.user_id) : undefined,
});


export const transformExpenseToBackend = (expense: Expense): {
  date: string;
  amount: number;
  description: string;
  category: string;
  auto_tagged?: boolean;
} => ({
  date: expense.date,
  amount: expense.amount,
  description: expense.description,
  category: expense.category,
  auto_tagged: expense.autoTagged,
});

export const transformBudgetAggregated = (
  data: BudgetAggregatedResponse['data']
): BudgetAggregatedData => {
  return {
    expenses: (data.expenses || []).map(transformExpense),
    budgetSummary: data.budget_summary,
  };
};

