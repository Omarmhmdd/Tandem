import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Expense, BudgetAggregatedData, UseBudgetAggregatedParams } from '../../types/budget.types';
import type { ExpensesResponse, SingleExpenseResponse, BudgetSummaryResponse, BudgetAggregatedResponse } from '../../types/api.types';
import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { useHasHousehold } from '../../hooks/useHasHousehold';
import { transformExpense, transformExpenseToBackend, transformBudgetAggregated } from '../../utils/transforms/budgetTransforms';


export const useBudgetAggregated = (params: UseBudgetAggregatedParams = {}) => {
  const hasHousehold = useHasHousehold();
  
  return useQuery<BudgetAggregatedData>({
    queryKey: ['budget', 'aggregated', params.startDate, params.endDate, params.year, params.month],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      if (params.startDate) queryParams.set('start_date', params.startDate);
      if (params.endDate) queryParams.set('end_date', params.endDate);
      if (params.year) queryParams.set('year', params.year.toString());
      if (params.month) queryParams.set('month', params.month.toString());
      
      const query = queryParams.toString();
      
      const response = await apiClient.get<BudgetAggregatedResponse>(
        `${ENDPOINTS.BUDGET_AGGREGATED}${query ? `?${query}` : ''}`
      );
      
      return transformBudgetAggregated(response.data);
    },
    enabled: hasHousehold,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};

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
      queryClient.invalidateQueries({ queryKey: ['budget', 'aggregated'] });
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
      queryClient.invalidateQueries({ queryKey: ['budget', 'aggregated'] });
    },
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
      queryClient.invalidateQueries({ queryKey: ['budget', 'aggregated'] });
    },
  });
};

