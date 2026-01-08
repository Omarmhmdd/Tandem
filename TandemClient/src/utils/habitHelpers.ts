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
  
  const today = getTodayNormalized();
  const mostRecent = sorted[0];
  const mostRecentDate = normalizeDate(mostRecent.date);
  
  // If the most recent completion is not today or yesterday, streak is 0
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor((today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // If most recent completion is more than 1 day ago, streak is broken
  if (daysDiff > 1) return 0;
  
  // Start counting from the most recent completion date
  let streak = 0;
  let currentDate = new Date(mostRecentDate);
  
  for (const completion of sorted) {
    const completionDate = normalizeDate(completion.date);
    
    if (completionDate.getTime() === currentDate.getTime()) {
      streak++;
      // Move to the previous day
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // If dates don't match consecutively, break the streak
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
  // If no completion exists, we should complete it
  // If completion exists but is not completed, we should complete it
  // If completion exists and is completed, we should uncomplete it (return false)
  return !existing || !existing.completed;
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
    return c.completed && 
           compDate.getMonth() === now.getMonth() && 
           compDate.getFullYear() === now.getFullYear();
  }).length;
};