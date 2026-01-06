<?php

namespace App\Http\Controllers;

use App\Services\BudgetService;
use App\Http\Requests\CreateExpenseRequest;
use App\Http\Requests\UpdateExpenseRequest;
use App\Http\Requests\CreateOrUpdateBudgetRequest;
use App\Http\Requests\DateRangeRequest;
use App\Http\Requests\BudgetSummaryRequest;
use App\Http\Resources\ExpenseResource;
use App\Models\Expense;
use App\Models\Budget;
use App\Http\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class BudgetController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected BudgetService $budgetService
    ) {}

    public function getExpenses(DateRangeRequest $request): JsonResponse
    {
        $expenses = $this->budgetService->getAllExpenses(
            $request->getStartDate(),
            $request->getEndDate()
        );

        return $this->success([
            'expenses' => ExpenseResource::collection($expenses),
        ]);
    }

    public function createExpense(CreateExpenseRequest $request): JsonResponse
    {
        $expense = $this->budgetService->createExpense($request->getExpenseData());

        return $this->expenseResponse($expense, 'Expense created successfully', 201);
    }

    public function updateExpense(UpdateExpenseRequest $request, int $id): JsonResponse
    {
        $expense = $this->budgetService->updateExpense($id, $request->getExpenseData());

        return $this->expenseResponse($expense, 'Expense updated successfully');
    }

    public function deleteExpense(int $id): JsonResponse
    {
        $this->budgetService->deleteExpense($id);

        return $this->success(null, 'Expense deleted successfully');
    }

    public function getSummary(BudgetSummaryRequest $request): JsonResponse
    {
        $summary = $this->budgetService->getBudgetSummary(
            $request->getYear(),
            $request->getMonth()
        );

        return $this->success($summary);
    }

    public function createOrUpdateBudget(CreateOrUpdateBudgetRequest $request): JsonResponse
    {
        $budget = $this->budgetService->createOrUpdateBudget($request->getBudgetData());

        return $this->budgetResponse($budget, 'Budget saved successfully');
    }
//extract these to use up for clean code
    protected function expenseResponse(Expense $expense, string $message, int $statusCode = 200): JsonResponse
    {
        $data = [
            'expense' => new ExpenseResource($expense),
        ];

        return $statusCode === 201 
            ? $this->created($data, $message)
            : $this->success($data, $message);
    }

    protected function budgetResponse(Budget $budget, string $message): JsonResponse
    {
        return $this->success([
            'budget' => $budget->toArray(),
        ], $message);
    }
}