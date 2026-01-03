<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\Budget;
use App\Data\BudgetSummaryData;
use App\Data\BudgetData;
use App\Data\ExpenseData;
use App\Http\Traits\VerifiesResourceOwnership;
use App\Http\Traits\UpdatesWeddingGoals;

class BudgetService
{
    use VerifiesResourceOwnership, UpdatesWeddingGoals;

    public function getAllExpenses(?string $startDate = null, ?string $endDate = null): \Illuminate\Support\Collection
    {
        $householdMember = $this->getActiveHouseholdMemberOrNull();

        if (!$householdMember) {
            return collect([]);
        }

        $query = Expense::where('household_id', $householdMember->household_id);

        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }

        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }

        return $query->orderBy('date', 'desc')
            ->get();
    }

    public function createExpense(array $expenseData): Expense
    {
        $expenseData = ExpenseData::prepare($expenseData);
        $expense = Expense::create($expenseData);

        $this->updateWeddingGoalIfNeeded($expense, 'add');

        return $expense;
    }

    public function updateExpense(int $id, array $expenseData): Expense
    {
        $expense = $this->findExpenseForHousehold($id);
        $wasWedding = $expense->category === 'wedding';
        $oldAmount = (float) $expense->amount;

        $expense->update($expenseData);
        $expense->refresh();

        $this->handleWeddingGoalUpdate($expense, $wasWedding, $oldAmount);

        return $expense->fresh();
    }

    public function deleteExpense(int $id): void
    {
        $expense = $this->findExpenseForHousehold($id);
        $this->updateWeddingGoalIfNeeded($expense, 'subtract');
        $expense->delete();
    }

    public function getBudgetSummary(?int $year = null, ?int $month = null): array
    {
        $householdMember = $this->getActiveHouseholdMemberOrNull();

        if (!$householdMember) {
            return BudgetSummaryData::empty();
        }

        $year = $year ?? now()->year;
        $month = $month ?? now()->month;

        $budget = $this->findBudgetForHousehold($householdMember->household_id, $year, $month);
        $totalExpenses = $this->calculateTotalExpenses($householdMember->household_id, $year, $month);

        return BudgetSummaryData::toArray($budget, (float) $totalExpenses);
    }

    public function createOrUpdateBudget(array $budgetData): Budget
    {
        $householdMember = $this->getActiveHouseholdMember();
        $preparedData = BudgetData::prepare($budgetData);
        $existingBudget = $this->findBudgetForHousehold(
            $householdMember->household_id,
            $preparedData['year'],
            $preparedData['month']
        );

        return Budget::updateOrCreate(
            BudgetData::getSearchCriteria($householdMember->household_id, $preparedData),
            BudgetData::getUpdateData($existingBudget, $preparedData, $this->getAuthenticatedUser()->id)
        );
    }

    protected function findExpenseForHousehold(int $id): Expense
    {
        $householdMember = $this->getActiveHouseholdMember();

        return Expense::where('id', $id)
            ->where('household_id', $householdMember->household_id)
            ->firstOrFail();
    }

    protected function findBudgetForHousehold(int $householdId, int $year, int $month): ?Budget
    {
        return Budget::where('household_id', $householdId)
            ->where('year', $year)
            ->where('month', $month)
            ->first();
    }

    protected function calculateTotalExpenses(int $householdId, int $year, int $month): float
    {
        return (float) Expense::where('household_id', $householdId)
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->sum('amount');
    }
}