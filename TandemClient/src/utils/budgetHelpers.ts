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
    groceries: 'bg-green-100 text-green-700',
    dining: 'bg-orange-100 text-orange-700',
    wedding: 'bg-pink-100 text-pink-700',
    health: 'bg-blue-100 text-blue-700',
    'big-ticket': 'bg-purple-100 text-purple-700',
    other: 'bg-gray-100 text-gray-700',
  };
  return colors[category] || colors.other;
};


