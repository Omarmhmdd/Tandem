import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/shared/PageHeader';
import { Plus, DollarSign, TrendingUp, TrendingDown, Edit, Trash2, Tag } from 'lucide-react';
import { useBudgetPage } from '../hooks/useBudget';
import { useModal } from '../hooks/useModal';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import type { Expense, ExpenseFormData } from '../types/budget.types';
import { EXPENSE_CATEGORIES } from '../utils/constants';

export const Budget: React.FC = () => {
  const {
    expenses,
    summary,
    saveExpense,
    deleteExpense,
    saveBudget,
    getCategoryColor,
    monthlyBudget,
    isLoading,
  } = useBudgetPage();

  const modal = useModal();
  const deleteConfirm = useConfirmDialog();

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isEditingBudget, setIsEditingBudget] = useState<boolean>(false);
  const [budgetAmount, setBudgetAmount] = useState<number>(0);
  const [showAllExpenses, setShowAllExpenses] = useState<boolean>(false);
  const [formData, setFormData] = useState<ExpenseFormData>({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    description: '',
    category: 'other',
  });

  // Sync budgetAmount with monthlyBudget when it changes (but not while editing)
  useEffect(() => {
    if (!isEditingBudget) {
      setBudgetAmount(monthlyBudget);
    }
  }, [monthlyBudget, isEditingBudget]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleOpenAdd = useCallback(() => {
    setEditingExpense(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      description: '',
      category: 'other',
    });
    modal.open();
  }, [modal]);

  const handleOpenEdit = useCallback((expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      date: expense.date,
      amount: expense.amount,
      description: expense.description,
      category: expense.category,
    });
    modal.open();
  }, [modal]);

  const handleSave = useCallback(async () => {
    const success = await saveExpense(formData, editingExpense);
    if (success) {
      modal.close();
      setEditingExpense(null);
    }
  }, [formData, editingExpense, saveExpense, modal]);

  const handleDelete = useCallback((id: string) => {
    deleteConfirm.open(id);
  }, [deleteConfirm]);

  const handleConfirmDelete = useCallback(() => {
    deleteConfirm.confirm((id) => {
      deleteExpense(id);
    });
  }, [deleteConfirm, deleteExpense]);

  const handleStartEditBudget = useCallback(() => {
    setBudgetAmount(monthlyBudget);
    setIsEditingBudget(true);
  }, [monthlyBudget]);

  const handleCancelEditBudget = useCallback(() => {
    setBudgetAmount(monthlyBudget);
    setIsEditingBudget(false);
  }, [monthlyBudget]);

  const handleSaveBudget = useCallback(async () => {
    const success = await saveBudget(budgetAmount);
    if (success) {
      setIsEditingBudget(false);
    }
  }, [budgetAmount, saveBudget]);

  const handleBudgetAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    if (value === '' || !isNaN(parseFloat(value))) {
      setBudgetAmount(parseFloat(value) || 0);
    }
  }, []);

  // Memoize formatted values to prevent unnecessary recalculations
  const formattedMonthlyBudget = useMemo(() => {
    return monthlyBudget > 0 
      ? `$${monthlyBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : 'Not set';
  }, [monthlyBudget]);

  const formattedSpent = useMemo(() => {
    return `$${summary.spent.toLocaleString()}`;
  }, [summary.spent]);

  const formattedRemaining = useMemo(() => {
    return monthlyBudget > 0 ? `$${summary.remaining.toLocaleString()}` : 'N/A';
  }, [monthlyBudget, summary.remaining]);

  const spendingPercentage = useMemo(() => {
    if (monthlyBudget <= 0) return 'N/A';
    const percentage = (summary.spent / monthlyBudget) * 100;
    return `${Math.min(percentage, 100).toFixed(0)}%`;
  }, [monthlyBudget, summary.spent]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Budget' }]} />
        <PageHeader
          title="Budget & Expenses"
          description="Track spending with automatic category tagging"
        />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-8 bg-gray-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Budget' }]} />

      <PageHeader
        title="Budget & Expenses"
        description="Track spending with automatic category tagging"
        action={{
          label: 'Log Expense',
          onClick: handleOpenAdd,
          icon: Plus,
        }}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-3">Monthly Budget</p>
            {isEditingBudget ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={budgetAmount > 0 ? budgetAmount.toString() : ''}
                      onChange={handleBudgetAmountChange}
                      placeholder="Enter amount"
                      className="text-lg font-semibold pr-12"
                      autoFocus
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">USD</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSaveBudget}
                    variant="primary"
                    size="sm"
                    className="flex-1"
                  >
                    Save
                  </Button>
                  <Button
                    onClick={handleCancelEditBudget}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formattedMonthlyBudget}
                  </p>
                  <button
                    onClick={handleStartEditBudget}
                    className="mt-2 text-sm text-brand-primary hover:text-brand-primary/80 font-medium"
                  >
                    {monthlyBudget > 0 ? 'Edit budget' : 'Set budget'}
                  </button>
                </div>
                <DollarSign className="w-10 h-10 text-blue-500" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formattedSpent}
                </p>
              </div>
              <TrendingDown className="w-10 h-10 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Remaining</p>
                <p className={`text-2xl font-bold ${monthlyBudget > 0 ? (summary.remaining >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-600'}`}>
                  {formattedRemaining}
                </p>
              </div>
              <TrendingUp className={`w-10 h-10 ${monthlyBudget > 0 ? (summary.remaining >= 0 ? 'text-green-500' : 'text-red-500') : 'text-gray-400'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Percentage</p>
                <p className="text-2xl font-bold text-gray-900">
                  {spendingPercentage}
                </p>
              </div>
              <Tag className="w-10 h-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(summary.byCategory).map(([category, amount]) => (
              <div key={category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize font-medium text-gray-700">{category}</span>
                  <span className="font-semibold text-gray-900">${amount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getCategoryColor(category).split(' ')[0]}`}
                    style={{ 
                      width: `${summary.spent > 0 ? Math.min((amount / summary.spent) * 100, 100) : 0}%` 
                    }}
                  />
                </div>
              </div>
            ))}
            {Object.keys(summary.byCategory).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No expenses logged yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="No expenses yet"
              description="Start tracking your spending by logging your first expense."
              action={{
                label: "Log Expense",
                onClick: handleOpenAdd,
                icon: Plus,
              }}
            />
          ) : (
            <>
              <div className="space-y-3">
                {(showAllExpenses ? expenses : expenses.slice(0, 5)).map((expense: Expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">
                          ${expense.amount.toLocaleString()}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(expense.category)}`}>
                          {expense.category}
                        </span>
                        {expense.autoTagged && (
                          <span className="text-xs text-gray-500">Auto-tagged</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{expense.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(expense)}
                        icon={Edit}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(expense.id)}
                        icon={Trash2}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {expenses.length > 5 && (
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowAllExpenses(!showAllExpenses)}
                  >
                    {showAllExpenses ? 'Show Less' : `View More (${expenses.length - 5} more)`}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title={editingExpense ? 'Edit Expense' : 'Log Expense'}
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={modal.close}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingExpense ? 'Save Changes' : 'Log Expense'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="e.g., Grocery shopping, Dinner at restaurant"
            required
          />

          <Input
            label="Amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            min="0"
            step="0.01"
            placeholder="0.00"
            required
          />

          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as Expense['category'] })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary focus:outline-none"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Category will be auto-tagged if left as "other" (unless editing)
            </p>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={deleteConfirm.close}
        onConfirm={handleConfirmDelete}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

    </div>
  );
};
