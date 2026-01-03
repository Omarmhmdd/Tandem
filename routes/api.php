<?php 
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\HouseholdController;
use App\Http\Controllers\HabitsController;
use App\Http\Controllers\HealthLogController;
use App\Http\Controllers\NutritionTargetController;
use App\Http\Controllers\GoalsController;

Route::group(['prefix' => 'v0.1'], function () {
    
    // Unauthenticated routes
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);

    // Protected routes
    Route::group(['middleware' => 'auth:api'], function () {
        
        Route::group(['prefix' => 'auth'], function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/me', [AuthController::class, 'me']);
        });

          // HOUSEHOLD MANAGEMENT 
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

             // HABITS
            Route::group(['prefix' => 'habits'], function () {
                Route::get('/', [HabitsController::class, 'index']);
                Route::post('/', [HabitsController::class, 'store']);
                Route::post('/{id}/update', [HabitsController::class, 'update']);
                Route::post('/{id}/delete', [HabitsController::class, 'destroy']);
                Route::post('/{id}/completions', [HabitsController::class, 'markCompletion']);
            });

            // HEALTH LOGS
            Route::group(['prefix' => 'health'], function () {
                Route::get('/logs', [HealthLogController::class, 'index']);
                Route::post('/logs', [HealthLogController::class, 'store']);
                Route::post('/logs/{id}/delete', [HealthLogController::class, 'destroy']);
            });


            // NUTRITION TARGET 
            Route::group(['prefix' => 'nutrition-target'], function () {
                Route::get('/', [NutritionTargetController::class, 'getTarget']);
                Route::post('/', [NutritionTargetController::class, 'updateTarget']);
            });

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


    });
});