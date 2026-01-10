import { useState, useMemo, useCallback } from 'react';
import { getWeekDates, getWeekStartDate } from '../utils/mealPlannerHelpers';
import type { UseWeekNavigationProps, UseWeekNavigationReturn } from '../types/meal.types';

export const useWeekNavigation = (
  props?: UseWeekNavigationProps
): UseWeekNavigationReturn => {
  const [currentWeekStart, setCurrentWeekStart] = useState<string>(() => 
    props?.initialWeekStart || getWeekStartDate(new Date())
  );

  // Normalize week start to Monday before sending to API
  // Uses useMemo to avoid recalculating on every render
  const normalizedWeekStart = useMemo(() => {
    if (!currentWeekStart) return currentWeekStart;
    
    const [year, month, day] = currentWeekStart.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    const dayOfWeek = date.getUTCDay();
    
    // Calculate Monday of the week containing this date
    // If Sunday (0), go back 6 days. Otherwise, go back (dayOfWeek - 1) days
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    date.setUTCDate(date.getUTCDate() + diff);
    
    return date.toISOString().split('T')[0];
  }, [currentWeekStart]);

  // Calculate week dates (Monday to Sunday) - memoized
  const weekDates = useMemo(() => {
    return getWeekDates(currentWeekStart);
  }, [currentWeekStart]);

  // Navigation functions - useCallback to prevent unnecessary re-renders
  const goToPreviousWeek = useCallback(() => {
    const currentDate = new Date(currentWeekStart);
    currentDate.setDate(currentDate.getDate() - 7);
    setCurrentWeekStart(getWeekStartDate(currentDate));
  }, [currentWeekStart]);

  const goToNextWeek = useCallback(() => {
    const currentDate = new Date(currentWeekStart);
    currentDate.setDate(currentDate.getDate() + 7);
    setCurrentWeekStart(getWeekStartDate(currentDate));
  }, [currentWeekStart]);

  const goToCurrentWeek = useCallback(() => {
    setCurrentWeekStart(getWeekStartDate(new Date()));
  }, []);

  return {
    currentWeekStart,
    normalizedWeekStart,
    weekDates,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
  };
};