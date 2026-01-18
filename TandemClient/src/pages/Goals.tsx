import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/shared/PageHeader';
import { Plus, Calendar, DollarSign, CheckCircle2, Circle, Edit, Trash2, X, Target, AlertCircle } from 'lucide-react';
import { useGoalsPage } from '../hooks/useGoals';
import { useModal } from '../hooks/useModal';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import  type { Goal, GoalFormData, Milestone } from '../types/goal.types';
import { useCreateMilestone, useUpdateMilestone, useDeleteMilestone } from '../api/queries/goals';
import { getCategoryColor } from '../utils/goalHelpers';

export const Goals: React.FC = () => {
  const {goals,budgetSummary,getGoalCompletionStatus,saveGoal,deleteGoal,updateProgress,quickAdd,getQuickAddSuggestions,} = useGoalsPage();

  const modal = useModal();
  const deleteConfirm = useConfirmDialog();
  const createMilestone = useCreateMilestone();
  const updateMilestoneMutation = useUpdateMilestone();
  const deleteMilestoneMutation = useDeleteMilestone();

  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [formData, setFormData] = useState<GoalFormData>({
    title: '',
    category: 'other',
    target: 100,
    current: 0,
    unit: '',
    deadline: '',
    milestones: [],
  });
  
  // Local state for progress input to avoid API calls on every keystroke
  const [progressInputs, setProgressInputs] = useState<Record<string, string>>({});
  
  // Track goals data to detect actual changes (avoid infinite loops from array reference changes)
  const previousGoalsDataRef = useRef<string>('');
  const goalsRef = useRef<Goal[]>([]);
  
  // Create stable serialized key from goals data (only when actual data changes)
  const currentGoalsData = useMemo(() => {
    goalsRef.current = goals;
    return goals.map(g => `${g.id}:${g.current}:${g.target}`).sort().join('|');
  }, [goals]);

  const handleOpenAdd = () => {
    setEditingGoal(null);
    setFormData({
      title: '',
      category: 'other',
      target: 100,
      current: 0,
      unit: '',
      deadline: '',
      milestones: [],
    });
    modal.open();
  };

  const handleOpenEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      category: goal.category,
      target: goal.target,
      current: goal.current,
      unit: goal.unit,
      deadline: goal.deadline || '',
      milestones: goal.milestones,
    });
    modal.open();
  };

  const handleSave = async () => {
    // Save the goal first (without milestones - they're managed separately)
    const goalDataWithoutMilestones: GoalFormData = {
      ...formData,
      milestones: [], // Don't send milestones in goal save
    };
    
    const savedGoal = await saveGoal(goalDataWithoutMilestones, editingGoal);
    if (savedGoal) {
      // Save milestones separately using the saved goal ID
      if (formData.milestones.length > 0) {
        try {
          if (editingGoal) {
            // For updates: sync milestones
            const existingMilestones = editingGoal.milestones || [];
            const existingIds = new Set(existingMilestones.map(m => m.id));
            const formIds = new Set(formData.milestones.map(m => m.id));
            
            // Delete milestones that were removed
            for (const existing of existingMilestones) {
              if (!formIds.has(existing.id)) {
                await deleteMilestoneMutation.mutateAsync({
                  goalId: savedGoal.id,
                  milestoneId: existing.id,
                });
              }
            }

            // Create or update milestones
            for (const milestone of formData.milestones) {
              if (milestone.title.trim()) {
                if (milestone.id && existingIds.has(milestone.id)) {
                  // Update existing milestone
                  await updateMilestoneMutation.mutateAsync({
                    goalId: savedGoal.id,
                    milestoneId: milestone.id,
                    milestone: {
                      title: milestone.title,
                      deadline: milestone.deadline,
                    },
                  });
                } else {
                  // Create new milestone
                  await createMilestone.mutateAsync({
                    goalId: savedGoal.id,
                    milestone: {
                      title: milestone.title,
                      completed: milestone.completed,
                      deadline: milestone.deadline,
                    },
                  });
                }
              }
            }
          } else {
            // For new goals: create all milestones
            for (const milestone of formData.milestones) {
              if (milestone.title.trim()) {
                await createMilestone.mutateAsync({
                  goalId: savedGoal.id,
                  milestone: {
                    title: milestone.title,
                    completed: milestone.completed,
                    deadline: milestone.deadline,
                  },
                });
              }
            }
          }
        } catch (error) {
          console.error('Failed to save milestones:', error);
        }
      }

      modal.close();
      setEditingGoal(null);
    }
  };

  const handleDelete = (id: string) => {
    deleteConfirm.open(id);
  };

  const handleConfirmDelete = () => {
    deleteConfirm.confirm((id) => {
      deleteGoal(id);
    });
  };

  // Initialize progress inputs when goals data actually changes (not just array reference)
  // This avoids infinite loops by comparing serialized data, not array references
  useEffect(() => {
    // Only update if goals data actually changed (deep comparison via serialized string)
    if (currentGoalsData !== previousGoalsDataRef.current) {
      previousGoalsDataRef.current = currentGoalsData;
      
      // Initialize progress inputs, preserving existing user inputs
      // Use goalsRef to access current goals without adding to dependency array
      const currentGoals = goalsRef.current;
      
      setProgressInputs(prev => {
        // Check if update is actually needed (avoid unnecessary state updates)
        const needsUpdate = currentGoals.some(goal => 
          !(goal.id in prev) || prev[goal.id] === ''
        ) || Object.keys(prev).some(goalId => 
          !currentGoals.find(g => g.id === goalId)
        );
        
        if (!needsUpdate) {
          return prev; // Return same reference if no update needed
        }
        
        const updated: Record<string, string> = { ...prev };
        
        // Add/update inputs for all current goals
        currentGoals.forEach((goal: Goal) => {
          // Only initialize if input doesn't exist yet or is empty
          // This preserves user input while they're typing
          if (!(goal.id in updated) || updated[goal.id] === '') {
            updated[goal.id] = goal.current.toString();
          }
        });
        
        // Remove inputs for goals that no longer exist
        const currentGoalIds = new Set(currentGoals.map(g => g.id));
        Object.keys(updated).forEach(goalId => {
          if (!currentGoalIds.has(goalId)) {
            delete updated[goalId];
          }
        });
        
        return updated;
      });
    }
  }, [currentGoalsData]); // Only depend on serialized data, not goals array reference

  const handleProgressInputChange = (goalId: string, value: string) => {
    // Only allow numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    setProgressInputs(prev => ({ ...prev, [goalId]: numericValue }));
  };

  const handleProgressInputBlur = (goalId: string) => {
    const goal = goals.find((g: Goal) => g.id === goalId);
    if (!goal) return;

    const completionStatus = getGoalCompletionStatus(goal);
    if (completionStatus.isComplete) {
      // Reset to current value if goal is complete
      setProgressInputs(prev => ({ ...prev, [goalId]: goal.current.toString() }));
      return;
    }

    const inputValue = parseFloat(progressInputs[goalId] || '0');
    if (isNaN(inputValue) || inputValue < 0) {
      // Reset to current value if invalid
      setProgressInputs(prev => ({ ...prev, [goalId]: goal.current.toString() }));
      return;
    }

    const cappedValue = Math.max(0, Math.min(inputValue, goal.target));
    updateProgress(goalId, cappedValue);
  };

  const handleProgressInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

    const handleQuickAdd = async (goalId: string, amount: number) => {
    await quickAdd(goalId, amount);
    
    // Update the input to reflect the new value
    const goal = goals.find((g: Goal) => g.id === goalId);
    if (goal) {
      const newValue = Math.min(goal.current + amount, goal.target);
      setProgressInputs(prev => ({ ...prev, [goalId]: newValue.toString() }));
    } 
  }; 

  const toggleMilestone = async (goalId: string, milestoneId: string) => {
    const goal = goals.find((g: Goal) => g.id === goalId);
    if (!goal) return;

    const milestone = goal.milestones.find((m) => m.id === milestoneId);
    if (!milestone) return;

    try {
      await updateMilestoneMutation.mutateAsync({
        goalId,
        milestoneId,
        milestone: { completed: !milestone.completed },
      });
    } catch (error) {
      console.error('Failed to update milestone:', error);
    }
  };

  const addMilestone = () => {
    const newMilestone: Milestone = {
      id: Date.now().toString(),
      title: '',
      completed: false,
    };
    setFormData({
      ...formData,
      milestones: [...formData.milestones, newMilestone],
    });
  };

  const removeMilestone = (milestoneId: string) => {
    setFormData({
      ...formData,
      milestones: formData.milestones.filter((m) => m.id !== milestoneId),
    });
  };

  const updateMilestone = (milestoneId: string, field: 'title' | 'deadline', value: string) => {
    setFormData({
      ...formData,
      milestones: formData.milestones.map((m) =>
        m.id === milestoneId ? { ...m, [field]: value } : m
      ),
    });
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Goals' }]} />

      <PageHeader
        title="Shared Goals"
        description="Set targets, track progress, and celebrate milestones together"
        action={{
          label: 'New Goal',
          onClick: handleOpenAdd,
          icon: Plus,
        }}
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'all'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          All ({goals.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'active'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Active ({goals.filter((g: Goal) => !getGoalCompletionStatus(g).isComplete).length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'completed'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Completed ({goals.filter((g: Goal) => getGoalCompletionStatus(g).isComplete).length})
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals
          .filter((goal: Goal) => {
            const completionStatus = getGoalCompletionStatus(goal);
            if (filter === 'active') return !completionStatus.isComplete;
            if (filter === 'completed') return completionStatus.isComplete;
            return true;
          })
          .map((goal: Goal) => {
          const completionStatus = getGoalCompletionStatus(goal);
          const progress = completionStatus.progress;
          return (
            <Card key={goal.id} hover>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{goal.title}</CardTitle>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getCategoryColor(goal.category)}`}>
                        {goal.category}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {goal.deadline && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>Due {new Date(goal.deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                      {goal.completed_at && (
                        <div className="flex items-center gap-1 text-sm text-purple-600 font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Completed {new Date(goal.completed_at).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(goal)}
                      icon={Edit}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(goal.id)}
                      icon={Trash2}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm font-medium text-gray-700 mb-3">
                    <span className="text-base">
                      {goal.current.toLocaleString()} {goal.unit}
                    </span>
                    <span className="text-base">
                      {goal.target.toLocaleString()} {goal.unit}
                      {completionStatus.hasMilestones && (
                        <span className="text-xs text-gray-500 ml-2 font-normal">
                          ({goal.milestones.filter((m) => m.completed).length}/{goal.milestones.length} milestones)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden relative shadow-inner">
                    <div
                      className={`h-full transition-all duration-700 ease-out rounded-full ${
                        completionStatus.isComplete 
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600' 
                          : completionStatus.hasMilestones && !completionStatus.allMilestonesComplete && progress >= 100
                          ? 'bg-gradient-to-r from-purple-400 to-purple-500'
                          : progress >= 75
                          ? 'bg-gradient-to-r from-purple-400 to-purple-500'
                          : progress >= 50
                          ? 'bg-gradient-to-r from-purple-300 to-purple-400'
                          : progress >= 25
                          ? 'bg-gradient-to-r from-purple-200 to-purple-300'
                          : 'bg-gradient-to-r from-purple-100 to-purple-200'
                      }`}
                      style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
                    />
                    {completionStatus.hasMilestones && !completionStatus.allMilestonesComplete && progress >= 100 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-white drop-shadow-sm">Complete milestones first</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-base font-bold ${
                      completionStatus.isComplete
                        ? 'text-purple-600'
                        : progress >= 66
                        ? 'text-purple-600'
                        : progress >= 33
                        ? 'text-purple-500'
                        : 'text-purple-400'
                    }`}>
                      {Math.round(progress)}%
                    </span>
                    {completionStatus.isComplete && (
                      <span className="text-xs font-semibold text-purple-700 flex items-center gap-1.5 bg-purple-50 px-2 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Goal Complete!
                      </span>
                    )}
                    {completionStatus.hasMilestones && !completionStatus.allMilestonesComplete && progress >= 100 && (
                      <span className="text-xs font-semibold text-purple-700 flex items-center gap-1.5 bg-purple-50 px-2 py-1 rounded-full">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Complete milestones
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Update */}
                <div className="p-5 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200 shadow-sm">
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    Update Your Progress
                  </label>
                  {completionStatus.isComplete ? (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-sm text-purple-700 font-medium">
                        This goal is completed and cannot be modified. If you need to make changes, please edit the goal.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={progressInputs[goal.id] ?? goal.current.toString()}
                            onChange={(e) => handleProgressInputChange(goal.id, e.target.value)}
                            onBlur={() => handleProgressInputBlur(goal.id)}
                            onKeyDown={handleProgressInputKeyDown}
                            className="w-full px-4 py-3 rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none text-gray-900 font-semibold text-lg transition-all"
                            placeholder="0"
                            maxLength={15}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          {goal.unit} of {goal.target.toLocaleString()} {goal.unit}
                        </span>
                      </div>
                    </>
                  )}
                  
                  {/* Quick Add Suggestions - Only show if goal is not complete */}
                  {!completionStatus.isComplete && (
                    <>
                      <div className="mb-3">
                        <p className="text-xs text-gray-600 mb-2 font-medium">Quick Add:</p>
                        <div className="flex flex-wrap gap-2">
                          {getQuickAddSuggestions(goal).map((amount, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleQuickAdd(goal.id, amount)}
                              className="px-4 py-2 text-sm font-semibold bg-white border-2 border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 hover:border-purple-400 hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={goal.current + amount > goal.target}
                            >
                              +{amount.toLocaleString()} {goal.unit}
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        💡 Tip: Type the number directly or use quick-add buttons above
                      </p>
                    </>
                  )}
                  
                  
                </div>

                {/* Milestones */}
                <div className="pt-5 border-t-2 border-gray-200 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-base font-bold text-gray-900">Milestones</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Complete all milestones to reach your goal
                      </p>
                    </div>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                      completionStatus.allMilestonesComplete 
                        ? 'text-purple-700 bg-purple-100' 
                        : completionStatus.hasMilestones 
                        ? 'text-purple-600 bg-purple-100' 
                        : 'text-gray-500 bg-gray-100'
                    }`}>
                      {goal.milestones.filter((m) => m.completed).length} / {goal.milestones.length} complete
                    </span>
                  </div>
                  {goal.milestones.length > 0 ? (
                    <div className="space-y-2">
                      {goal.milestones.map((milestone) => (
                        <button
                          key={milestone.id}
                          onClick={() => toggleMilestone(goal.id, milestone.id)}
                          className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all shadow-sm ${
                            milestone.completed
                              ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 hover:from-purple-100 hover:to-indigo-100'
                              : 'bg-white border-2 border-gray-200 hover:border-purple-500 hover:shadow-md'
                          }`}
                          title={milestone.completed ? 'Click to mark as incomplete' : 'Click to mark as complete'}
                        >
                          {milestone.completed ? (
                            <CheckCircle2 className="w-7 h-7 text-purple-600 flex-shrink-0" />
                          ) : (
                            <Circle className="w-7 h-7 text-gray-400 flex-shrink-0 hover:text-purple-600 transition-colors" />
                          )}
                          <span
                            className={`text-sm flex-1 text-left font-semibold ${
                              milestone.completed ? 'text-gray-600 line-through' : 'text-gray-900'
                            }`}
                          >
                            {milestone.title}
                          </span>
                          {milestone.deadline && (
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {new Date(milestone.deadline).toLocaleDateString()}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No milestones yet. Edit this goal to add milestones!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {goals
        .filter((goal: Goal) => {
          const completionStatus = getGoalCompletionStatus(goal);
          if (filter === 'active') return !completionStatus.isComplete;
          if (filter === 'completed') return completionStatus.isComplete;
          return true;
        })
        .length === 0 && (
        <Card>
          <CardContent>
            <EmptyState
              icon={Target}
              title="No goals yet"
              description="Set your first shared goal to start tracking progress together. Goals can be for wedding planning, health, finances, or anything else!"
              action={{
                label: "Create Your First Goal",
                onClick: handleOpenAdd,
                icon: Plus,
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Budget Tracker Card */}
      {budgetSummary && (
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Budget Tracker
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Monthly Budget</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${budgetSummary.budget?.monthly_budget 
                    ? parseFloat(budgetSummary.budget.monthly_budget.toString()).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : '0.00'}
                </p>
                {!budgetSummary.budget && (
                  <p className="text-xs text-gray-500 mt-1">Set your budget in the Budget page</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Spent This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${budgetSummary.total_expenses 
                    ? parseFloat(budgetSummary.total_expenses.toString()).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : '0.00'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Remaining</p>
                <p className={`text-2xl font-bold ${
                  budgetSummary.remaining !== null && budgetSummary.remaining !== undefined && budgetSummary.remaining >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  ${budgetSummary.remaining !== null && budgetSummary.remaining !== undefined
                    ? parseFloat(budgetSummary.remaining.toString()).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : 'N/A'}
                </p>
                {budgetSummary.remaining !== null && budgetSummary.remaining !== undefined && budgetSummary.remaining < 0 && (
                  <p className="text-xs text-red-500 mt-1">Over budget</p>
                )}
              </div>
            </div>
            {!budgetSummary.budget && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  💡 No budget set for this month. Go to the Budget page to set your monthly budget.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title={editingGoal ? 'Edit Goal' : 'New Goal'}
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={modal.close}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingGoal ? 'Save Changes' : 'Create Goal'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Goal Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Wedding Fund, Save for House, Run Marathon"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as Goal['category'] })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary focus:outline-none"
            >
              <option value="wedding">💍 Wedding</option>
              <option value="health">🏃 Health & Fitness</option>
              <option value="financial">💰 Financial</option>
              <option value="other">📌 Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Target Amount"
              type="number"
              value={formData.target}
              onChange={(e) => setFormData({ ...formData, target: parseFloat(e.target.value) || 0 })}
              min="0"
              step="0.01"
              placeholder="e.g., 15000"
              required
            />
            <Input
              label="Unit"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              placeholder="e.g., $, steps, lbs"
              required
            />
          </div>
          <p className="text-xs text-gray-500 -mt-2">
            Examples: $5000, 10000 steps, 10 lbs, etc.
          </p>

          <Input
            label="Starting Progress (Current Amount)"
            type="number"
            value={formData.current}
            onChange={(e) => setFormData({ ...formData, current: parseFloat(e.target.value) || 0 })}
            min="0"
            placeholder="How much have you already completed?"
          />

          <Input
            label="Deadline (optional)"
            type="date"
            value={formData.deadline || ''}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          />

          {/* Milestones Management */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Milestones (optional)
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={Plus}
                onClick={addMilestone}
              >
                Add Milestone
              </Button>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Break your goal into smaller, trackable steps
            </p>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {formData.milestones.map((milestone, index) => (
                <div key={milestone.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder={`Milestone ${index + 1} title`}
                        value={milestone.title}
                        onChange={(e) => updateMilestone(milestone.id, 'title', e.target.value)}
                        className="text-sm"
                      />
                      <Input
                        type="date"
                        placeholder="Deadline (optional)"
                        value={milestone.deadline || ''}
                        onChange={(e) => updateMilestone(milestone.id, 'deadline', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMilestone(milestone.id)}
                      icon={X}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              {formData.milestones.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4 italic">
                  No milestones yet. Click "Add Milestone" to create one.
                </p>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={deleteConfirm.close}
        onConfirm={handleConfirmDelete}
        title="Delete Goal"
        message="Are you sure you want to delete this goal? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};
