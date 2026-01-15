import type { Expense, BudgetSummary } from '../types/budget.types';


export const calculateBudgetSummary = (expenses: Expense[], monthlyBudget: number = 0): BudgetSummary => {
  const summary: BudgetSummary = expenses.reduce((acc, exp) => {
    acc.spent += exp.amount;
    acc.byCategory[exp.category] = (acc.byCategory[exp.category] || 0) + exp.amount;
    return acc;
  }, {
    monthlyBudget,
    spent: 0,
    remaining: monthlyBudget,
    byCategory: {} as Record<string, number>,
  });
  
  summary.remaining = monthlyBudget - summary.spent;
  return summary;
};


export const autoTagCategory = (description: string, amount: number): Expense['category'] => {
  const lower = description.toLowerCase();
  
  if (lower.includes('grocery') || lower.includes('food') || lower.includes('supermarket')) {
    return 'groceries';
  }
  if (lower.includes('restaurant') || lower.includes('dining') || lower.includes('cafe')) {
    return 'dining';
  }
  if (lower.includes('wedding') || lower.includes('venue') || lower.includes('catering')) {
    return 'wedding';
  }
  if (lower.includes('doctor') || lower.includes('health') || lower.includes('medical')) {
    return 'health';
  }
  if (amount > 500) {
    return 'big-ticket';
  }
  return 'other';
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    groceries: 'bg-purple-400 text-white',
    dining: 'bg-gray-500 text-white',
    wedding: 'bg-purple-600 text-white',
    health: 'bg-purple-300 text-gray-800',
    'big-ticket': 'bg-gray-700 text-white',
    other: 'bg-gray-400 text-white',
  };
  return colors[category] || colors.other;
};



