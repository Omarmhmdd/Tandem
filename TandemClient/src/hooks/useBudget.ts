import { useMemo } from 'react';
import { useBudgetAggregated, useExpenseMutation, useDeleteExpense, useBudgetMutation } from '../api/queries/budget';
import type { Expense, ExpenseFormData, BudgetSummary } from '../types/budget.types';
import { showToast } from '../utils/toast';
import { autoTagCategory, getCategoryColor, calculateBudgetSummary } from '../utils/budgetHelpers';

export const useBudgetPage = () => {
  // Fetch all budget data in a single aggregated call
  const { data: aggregatedData, isLoading } = useBudgetAggregated();
  
  // Extract data from aggregated response
  const expenses = aggregatedData?.expenses || [];
  const budgetSummary = aggregatedData?.budgetSummary;
  
  const mutation = useExpenseMutation();
  const deleteMutation = useDeleteExpense();
  const budgetMutation = useBudgetMutation();

  // Memoize monthly budget to prevent unnecessary recalculations
  const monthlyBudget = useMemo(() => {
    const budget = budgetSummary?.budget?.monthly_budget;
    return typeof budget === 'string' ? parseFloat(budget) : (budget || 0);
  }, [budgetSummary?.budget?.monthly_budget]);

  // Calculate summary with proper fallbacks
  const summary: BudgetSummary = useMemo(() => {
    // Prefer backend-calculated values (source of truth)
    const spent = (budgetSummary?.total_expenses !== undefined && budgetSummary?.total_expenses !== null) 
      ? budgetSummary.total_expenses 
      : expenses.reduce((sum: number, exp: Expense) => sum + exp.amount, 0);
    
    const remaining = (budgetSummary?.remaining !== null && budgetSummary?.remaining !== undefined) 
      ? budgetSummary.remaining 
      : monthlyBudget - spent;
    
    // Use helper function for category breakdown
    const calculatedSummary = calculateBudgetSummary(expenses, monthlyBudget);
    
    return {
      monthlyBudget,
      spent,
      remaining,
      byCategory: calculatedSummary.byCategory,
    };
  }, [expenses, budgetSummary, monthlyBudget]);


  
  const saveExpense = async (formData: ExpenseFormData, editingExpense: Expense | null): Promise<boolean> => {
    if (!formData.amount || !formData.description?.trim()) {
      showToast('Please fill in all required fields', 'error');
      return false;
    }

    if (formData.amount <= 0) {
      showToast('Amount must be greater than 0', 'error');
      return false;
    }

    // Auto-tag category if not provided or if creating new expense
    const category = formData.category === 'other' && !editingExpense
      ? autoTagCategory(formData.description, formData.amount)
      : formData.category;

    const expenseData: Expense = {
      ...formData,
      id: editingExpense?.id || Date.now().toString(),
      category,
      autoTagged: !editingExpense && formData.category === 'other',
      date: formData.date || new Date().toISOString().split('T')[0],
    };

    try {
      await mutation.mutateAsync({ expense: expenseData, isUpdate: !!editingExpense });
      showToast(
        editingExpense ? 'Expense updated successfully' : 'Expense logged successfully',
        'success'
      );
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save expense';
      showToast(errorMessage, 'error');
      return false;
    }
  };


  const deleteExpense = async (id: string): Promise<void> => {
    try {
      await deleteMutation.mutateAsync(id);
      showToast('Expense deleted successfully', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete expense';
      showToast(errorMessage, 'error');
    }
  };

  const saveBudget = async (monthlyBudget: number, year?: number, month?: number): Promise<boolean> => {
    if (monthlyBudget <= 0) {
      showToast('Monthly budget must be greater than 0', 'error');
      return false;
    }

    try {
      await budgetMutation.mutateAsync({ monthly_budget: monthlyBudget, year, month });
      showToast('Budget saved successfully', 'success');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save budget';
      showToast(errorMessage, 'error');
      return false;
    }
  };

  return {
    expenses,
    summary,
    isLoading,
    saveExpense,
    deleteExpense,
    saveBudget,
    getCategoryColor,
    monthlyBudget,
  };
};

