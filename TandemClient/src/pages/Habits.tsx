import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/shared/PageHeader';
import { ActionButtons } from '../components/shared/ActionButtons';
import { Plus, CheckCircle2, Circle, Clock, Target, Flame } from 'lucide-react';
import { useHabits } from '../hooks/useHabits';
import { useModal } from '../hooks/useModal';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import type { Habit, HabitFormData } from '../types/habit.types';
import { calculateStreak, getMonthlyCompletions } from '../utils/habitHelpers';

export const Habits: React.FC = () => {
    const {habits,saveHabit,deleteHabit,toggleCompletion,isCompletedToday,isLoading,} = useHabits();

    const modal = useModal();
    const deleteConfirm = useConfirmDialog();

    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [formData, setFormData] = useState<HabitFormData>({name: '',description: '',frequency: 'daily',reminderTime: '',});

  const handleOpenAdd = () => {
    setEditingHabit(null);
    setFormData({name: '',description: '',frequency: 'daily',reminderTime: '',});
    modal.open();
  };

  const handleOpenEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setFormData({name: habit.name,description: habit.description || '',frequency: habit.frequency,reminderTime: habit.reminderTime || '',});
    modal.open();
  };

  const handleSave = async () => {
    const success = await saveHabit(formData, editingHabit);
    if (success) {
      modal.close();
      setEditingHabit(null);
    }
  };

  const handleDelete = (id: string) => {
    deleteConfirm.open(id);
  };

  const handleConfirmDelete = () => {
    deleteConfirm.confirm((id) => {
      deleteHabit(id);
    });
  };
  if (isLoading) {
      return (
        <div className="space-y-6">
          <Breadcrumbs items={[{ label: 'Habits' }]} />
          <PageHeader
            title="Habits"
            description="Track daily activities and build consistency. Click the circle to mark habits as complete!"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-5 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                  <div className="h-20 bg-gray-100 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Habits' }]} />

      <PageHeader
        title="Habits"
        description="Track daily activities and build consistency. Click the circle to mark habits as complete!"
        action={{
          label: 'New Habit',
          onClick: handleOpenAdd,
          icon: Plus,
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {habits.map((habit) => {
          const streak = calculateStreak(habit);
          const monthlyCompletions = getMonthlyCompletions(habit);
          
          return (
            <Card key={habit.id} hover>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">{habit.name}</h3>
                    {habit.description && (
                      <p className="text-sm text-gray-600 mb-2">{habit.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="capitalize">{habit.frequency}</span>
                      {habit.reminderTime && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{habit.reminderTime}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <ActionButtons
                    onEdit={() => handleOpenEdit(habit)}
                    onDelete={() => handleDelete(habit.id)}
                  />
                </div>

                <div className="space-y-4">
                  {/* Completion Toggle */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleCompletion(habit.id)}
                        className={`flex-shrink-0 p-2 rounded-full transition-all ${
                          isCompletedToday(habit)
                            ? 'bg-green-500 hover:bg-green-600 shadow-md shadow-green-200'
                            : 'bg-white hover:bg-gray-100 border-2 border-gray-300 hover:border-brand-primary'
                        }`}
                        aria-label={isCompletedToday(habit) ? 'Mark as incomplete' : 'Mark as complete'}
                        title={isCompletedToday(habit) ? 'Completed today! Click to undo' : 'Click to mark as complete'}
                      >
                        {isCompletedToday(habit) ? (
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {isCompletedToday(habit) ? 'Completed Today' : 'Mark as Complete'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {isCompletedToday(habit) ? 'Great job! ' : 'Click the circle to complete'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Streak Display */}
                    <div className="p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Flame className="w-4 h-4 text-orange-600" />
                        <p className="text-xs font-medium text-gray-700">Streak</p>
                      </div>
                      <p className="text-2xl font-bold text-orange-600">{streak}</p>
                      <p className="text-xs text-gray-500">day{streak !== 1 ? 's' : ''}</p>
                    </div>

                    {/* Completion Stats */}
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-brand-primary" />
                        <p className="text-xs font-medium text-gray-700">This Month</p>
                      </div>
                      <p className="text-2xl font-bold text-brand-primary">{monthlyCompletions}</p>
                      <p className="text-xs text-gray-500">completed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {habits.length === 0 && (
        <Card>
          <CardContent>
            <EmptyState
              icon={Target}
              title="No habits yet"
              description="Create your first habit to start tracking your daily activities."
              action={{
                label: 'Create Habit',
                onClick: handleOpenAdd,
                icon: Plus,
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title={editingHabit ? 'Edit Habit' : 'New Habit'}
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={modal.close}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingHabit ? 'Save Changes' : 'Create Habit'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Habit Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Drink Water"
            required
          />

          <Input
            label="Description (optional)"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="e.g., Drink 8 glasses of water"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Frequency</label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value as Habit['frequency'] })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary focus:outline-none"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <Input
            label="Reminder Time (optional)"
            type="time"
            value={formData.reminderTime || ''}
            onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
          />
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={deleteConfirm.close}
        onConfirm={handleConfirmDelete}
        title="Delete Habit"
        message="Are you sure you want to delete this habit? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};