import type { Habit, HabitFormData, HabitCompletion } from '../types/habit.types';


export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};


const normalizeDate = (date: Date | string): Date => {
  const d = typeof date === 'string' ? new Date(date) : date;
  d.setHours(0, 0, 0, 0);
  return d;
};

const getTodayNormalized = (): Date => {
  return normalizeDate(new Date());
};


const getSortedCompletions = (completions: HabitCompletion[]): HabitCompletion[] => {
  return completions
    .filter(c => c.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};


const calculateStreakFromCompletions = (completions: HabitCompletion[]): number => {
  const sorted = getSortedCompletions(completions);
  
  if (sorted.length === 0) return 0;
  
  let streak = 0;
  const today = getTodayNormalized();
  
  for (let i = 0; i < sorted.length; i++) {
    const completionDate = normalizeDate(sorted[i].date);
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    expectedDate.setHours(0, 0, 0, 0);
    
    if (completionDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

export const calculateStreak = (habit: Habit): number => {
  return calculateStreakFromCompletions(habit.completions);
};


export const isCompletedToday = (habit: Habit): boolean => {
  const today = getTodayDateString();
  return habit.completions.some(c => c.date === today && c.completed);
};


export const calculateStreakAfterToggle = (habit: Habit, willComplete: boolean): number => {
  const today = getTodayDateString();
  const existing = habit.completions.find(c => c.date === today);
  
  let testCompletions: HabitCompletion[];
  
  if (willComplete && !existing) {
    testCompletions = [...habit.completions, { date: today, completed: true }];
  } else if (existing) {
    testCompletions = habit.completions.filter(c => c.date !== today);
  } else {
    testCompletions = habit.completions;
  }
  
  return calculateStreakFromCompletions(testCompletions);
};


export const validateHabitForm = (formData: HabitFormData): { isValid: boolean; error?: string } => {
  if (!formData.name?.trim()) {
    return { isValid: false, error: 'Please enter a habit name' };
  }
  return { isValid: true };
};


export const createHabitData = (formData: HabitFormData, editingHabit: Habit | null): Habit => {
  return {
    ...formData,
    id: editingHabit?.id || Date.now().toString(),
    completions: editingHabit?.completions || [],
  };
};

export const findCompletionByDate = (habit: Habit, date: string): HabitCompletion | undefined => {
  return (habit.completions || []).find((c: HabitCompletion) => c.date === date);
};


export const shouldCompleteHabit = (habit: Habit, date: string): boolean => {
  const existing = findCompletionByDate(habit, date);
  return !existing;
};

export const formatStreakMessage = (habitName: string, streak: number): string => {
  if (streak > 0) {
    return `${habitName} completed! Streak: ${streak} day${streak !== 1 ? 's' : ''}`;
  }
  return `${habitName} completed! Keep it up!`;
};

export const getMonthlyCompletions = (habit: Habit): number => {
  const now = new Date();
  return habit.completions.filter((c: HabitCompletion) => {
    const compDate = new Date(c.date);
    return compDate.getMonth() === now.getMonth() && 
           compDate.getFullYear() === now.getFullYear();
  }).length;
};