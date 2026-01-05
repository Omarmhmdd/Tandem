<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\HouseholdController;
use App\Http\Controllers\HabitsController;
use App\Http\Controllers\HealthLogController;
use App\Http\Controllers\NutritionTargetController;
use App\Http\Controllers\GoalsController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\MoodController;
use App\Http\Controllers\WeeklySummaryController;
use App\Http\Controllers\RecipesController;
use App\Http\Controllers\MealPlannerController;
use App\Http\Controllers\PantryController;
use App\Http\Controllers\ShoppingListController;
use App\Http\Controllers\AutoOrderController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\DateNightController;

Route::group(['prefix' => 'v0.1'], function () {
    // Unauthenticated routes
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);

    // Protected routes
    Route::group(['middleware' => 'auth:api'], function () {
        // AUTH - No household required
        Route::group(['prefix' => 'auth'], function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/me', [AuthController::class, 'me']);
        });

        // HOUSEHOLD MANAGEMENT - No household required (user needs to create/join)
        Route::group(['prefix' => 'household'], function () {
            Route::post('/create/{name}', [HouseholdController::class, 'create']);
            Route::get('/getAll/{household_id?}', [HouseholdController::class, 'getAllByUserId']);
            Route::post('/join/{code}', [HouseholdController::class, 'join']);
            
            // These require household (user must be in a household to access)
            Route::group(['middleware' => 'require.household'], function () {
                Route::get('/{household_id}/invite-code', [HouseholdController::class, 'getInviteCode']);
                Route::post('/{household_id}/regenerate-invite-code', [HouseholdController::class, 'regenerateInviteCode'])->middleware('require.primary');
                Route::get('/{household_id}/members', [HouseholdController::class, 'getMembers']);
                Route::post('/{household_id}/leave', [HouseholdController::class, 'leaveHousehold']);
                Route::post('/{household_id}/transfer-ownership', [HouseholdController::class, 'transferOwnership'])->middleware('require.primary');
                Route::post('/{household_id}/delete', [HouseholdController::class, 'deleteHousehold'])->middleware('require.primary');
            });
        });

        // HABITS - User-specific, no household required
        Route::group(['prefix' => 'habits'], function () {
            Route::get('/', [HabitsController::class, 'index']);
            Route::post('/', [HabitsController::class, 'store']);
            Route::post('/{id}/update', [HabitsController::class, 'update']);
            Route::post('/{id}/delete', [HabitsController::class, 'destroy']);
            Route::post('/{id}/completions', [HabitsController::class, 'markCompletion']);
        });

        // HEALTH LOGS - User-specific, no household required
        Route::group(['prefix' => 'health'], function () {
            Route::get('/logs', [HealthLogController::class, 'index']);
            Route::post('/logs', [HealthLogController::class, 'store']);
            Route::post('/logs/parse', [HealthLogController::class, 'parse']);
            Route::post('/logs/{id}/delete', [HealthLogController::class, 'destroy']);
        });

        // NUTRITION TARGET - User-specific, no household required
        Route::group(['prefix' => 'nutrition-target'], function () {
            Route::get('/', [NutritionTargetController::class, 'getTarget']);
            Route::post('/', [NutritionTargetController::class, 'updateTarget']);
        });

        // ALL OTHER ROUTES - Require household
        Route::group(['middleware' => 'require.household'], function () {
            // GOALS
            Route::group(['prefix' => 'goals'], function () {
                Route::get('/', [GoalsController::class, 'index']);
                Route::post('/', [GoalsController::class, 'store']);
                Route::post('/{id}/update', [GoalsController::class, 'update']);
                Route::post('/{id}/delete', [GoalsController::class, 'destroy']);
                Route::post('/{id}/progress', [GoalsController::class, 'updateProgress']);
                Route::post('/{id}/milestones', [GoalsController::class, 'createMilestone']);
                Route::post('/{id}/milestones/{milestoneId}/update', [GoalsController::class, 'updateMilestone']);
                Route::post('/{id}/milestones/{milestoneId}/delete', [GoalsController::class, 'deleteMilestone']);
            });

            // BUDGET & EXPENSES
            Route::group(['prefix' => 'budget'], function () {
                Route::post('/', [BudgetController::class, 'createOrUpdateBudget']);
                Route::get('/expenses', [BudgetController::class, 'getExpenses']);
                Route::post('/expenses', [BudgetController::class, 'createExpense']);
                Route::post('/expenses/{id}/update', [BudgetController::class, 'updateExpense']);
                Route::post('/expenses/{id}/delete', [BudgetController::class, 'deleteExpense']);
                Route::get('/summary', [BudgetController::class, 'getSummary']);
            });

            // MOOD TRACKING
            Route::group(['prefix' => 'mood'], function () {
                Route::get('/timeline', [MoodController::class, 'getTimeline']);
                Route::get('/comparison', [MoodController::class, 'getComparison']);
                Route::post('/entries', [MoodController::class, 'createEntry']);
                Route::post('/annotations', [MoodController::class, 'autoAnnotate']);
            });

            // WEEKLY SUMMARIES
            Route::group(['prefix' => 'weekly-summaries'], function () {
                Route::get('/', [WeeklySummaryController::class, 'index']);
                Route::post('/', [WeeklySummaryController::class, 'generate']);
            });

            // DATE NIGHT PLANNER
            Route::group(['prefix' => 'date-night'], function () {
                Route::get('/', [DateNightController::class, 'index']);
                Route::post('/', [DateNightController::class, 'generate']);
                Route::post('/{id}/accept', [DateNightController::class, 'accept']);
            });

                    // ANALYTICS
        Route::group(['prefix' => 'analytics'], function () {
            Route::get('/weekly', [AnalyticsController::class, 'getWeekly']);
            Route::get('/monthly-mood', [AnalyticsController::class, 'getMonthlyMood']);
            Route::get('/pantry-waste', [AnalyticsController::class, 'getPantryWaste']);
            Route::get('/budget-categories', [AnalyticsController::class, 'getBudgetCategories']);
        });

        // AUTO-ORDER
            Route::group(['prefix' => 'auto-order'], function () {
                Route::get('/partners', [AutoOrderController::class, 'getPartners']);
                Route::post('/send', [AutoOrderController::class, 'sendOrder']);
            });

            // RECIPES
            Route::group(['prefix' => 'recipes'], function () {
                Route::get('/', [RecipesController::class, 'index']);
                Route::post('/', [RecipesController::class, 'store']);
                Route::get('/{id}', [RecipesController::class, 'show']);
                Route::post('/{id}/update', [RecipesController::class, 'update']);
                Route::post('/{id}/delete', [RecipesController::class, 'destroy']);
                Route::post('/{id}/link-pantry', [RecipesController::class, 'linkPantry']);
            });

            // MEAL PLANNER
            Route::group(['prefix' => 'meals'], function () {
                Route::get('/plan', [MealPlannerController::class, 'getWeeklyPlan']);
                Route::post('/plan', [MealPlannerController::class, 'store']);
                Route::post('/plan/{id}/update', [MealPlannerController::class, 'update']);
                Route::post('/plan/{id}/delete', [MealPlannerController::class, 'destroy']);
                Route::post('/match-meal', [MealPlannerController::class, 'createMatchMeal']);
                Route::post('/match-meal/{id}/respond', [MealPlannerController::class, 'respondToMatchMeal']);
                Route::post('/shopping-list/{planId}', [ShoppingListController::class, 'generate']);
            });

            // PANTRY
            Route::group(['prefix' => 'pantry'], function () {
                Route::get('/', [PantryController::class, 'index']);
                Route::post('/', [PantryController::class, 'store']);
                Route::post('/{id}/update', [PantryController::class, 'update']);
                Route::post('/{id}/delete', [PantryController::class, 'destroy']);
            });
        });
    });
});