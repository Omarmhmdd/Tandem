import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Expense } from '../../types/budget.types';
import type { ExpensesResponse, SingleExpenseResponse, BudgetSummaryResponse } from '../../types/api.types';
import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { useHasHousehold } from '../../hooks/useHasHousehold';
import { transformExpense, transformExpenseToBackend } from '../../utils/transforms/budgetTransforms';

export const useExpenses = () => {
  const hasHousehold = useHasHousehold();
  
  return useQuery<Expense[]>({
    queryKey: ['expenses'],
    queryFn: async () => {
      const response = await apiClient.get<ExpensesResponse>(ENDPOINTS.EXPENSES);
      const backendExpenses = response.data.expenses || [];
      return backendExpenses.map(transformExpense);
    },
    enabled: hasHousehold, // Only fetch if household exists
    staleTime: 1000 * 60 * 5,
  });
};

export const useExpenseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Expense, Error, { expense: Expense; isUpdate: boolean }>({
    mutationFn: async ({ expense, isUpdate }) => {
      const backendData = transformExpenseToBackend(expense);
      const endpoint = isUpdate 
        ? ENDPOINTS.EXPENSE_UPDATE(expense.id)
        : ENDPOINTS.EXPENSES;
      
      const response = await apiClient.post<SingleExpenseResponse>(endpoint, backendData);
      return transformExpense(response.data.expense);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['budgetSummary'] });
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(ENDPOINTS.EXPENSE_DELETE(id));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['budgetSummary'] });
    },
  });
};

export const useBudgetSummary = (year?: number, month?: number) => {
  const hasHousehold = useHasHousehold();
  
  return useQuery<BudgetSummaryResponse['data']>({
    queryKey: ['budgetSummary', year, month],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (year) params.append('year', year.toString());
      if (month) params.append('month', month.toString());
      const query = params.toString();
      const response = await apiClient.get<BudgetSummaryResponse>(
        `${ENDPOINTS.BUDGET_SUMMARY}${query ? `?${query}` : ''}`
      );
      return response.data;
    },
    enabled: hasHousehold, // Only fetch if household exists
    staleTime: 1000 * 60 * 5,
  });
};

export const useBudgetMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ monthly_budget, year, month }: { monthly_budget: number; year?: number; month?: number }) => {
      const response = await apiClient.post<BudgetSummaryResponse>(
        ENDPOINTS.BUDGET,
        { monthly_budget, year, month }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetSummary'] });
    },
  });
};

