import type {WeeklyAnalytics,MonthlyMood,PantryWaste,BudgetCategory,WeeklyChartData,PantryWasteChartData,BackendWeeklyAnalytics,BackendMonthlyMood,BackendPantryWaste,BackendBudgetCategory,} from '../../types/analytics.types';

export const transformWeeklyAnalytics = (
  data: BackendWeeklyAnalytics
): WeeklyAnalytics => ({
  steps: data.steps || [],
  sleep: data.sleep || [],
  mood: data.mood || [],
  totalSteps: data.total_steps || 0,
  avgSleep: data.avg_sleep || 0,
  avgMood: data.avg_mood || 0,
});


export const transformMonthlyMood = (
  data: BackendMonthlyMood[]
): MonthlyMood[] => {
  return data.map((item) => ({
    month: item.month,
    me: item.me,
    partner: item.partner,
  }));
};

export const transformPantryWaste = (
  data: BackendPantryWaste
): PantryWaste => ({
  active: data.active || 0,
  expiring_soon: data.expiring_soon || 0,
  deleted: data.deleted || 0,
  totalItems: data.total_items,
});


export const transformBudgetCategory = (
  data: BackendBudgetCategory[]
): BudgetCategory[] => {
  return data.map((item) => ({
    category: item.category,
    amount: item.amount || 0,
    budget: item.budget || 0,
  }));
};


export const transformWeeklyDataForChart = (
  weeklyAnalytics: WeeklyAnalytics,
  timeRange: 'week' | 'month' = 'week'
): WeeklyChartData[] => {
  const steps = weeklyAnalytics.steps || [];
  const sleep = weeklyAnalytics.sleep || [];
  const mood = weeklyAnalytics.mood || [];
  
  // Create daily data array by index (preserves chronological order)
  const dailyData: WeeklyChartData[] = [];
  const maxLength = Math.max(steps.length, sleep.length, mood.length);
  
  for (let i = 0; i < maxLength; i++) {
    const step = steps[i];
    const sleepEntry = sleep[i];
    const moodEntry = mood[i];
    
    dailyData.push({
      day: step?.day || sleepEntry?.day || moodEntry?.day || '',
      me: step?.me ?? 0,
      partner: step?.partner ?? 0,
      sleep: sleepEntry?.hours ?? null,
      mood: moodEntry?.me ?? null,
    });
  }
  
  // If month view and we have more than 7 days, group by weeks (4 weeks)
  if (timeRange === 'month' && dailyData.length > 7) {
    const weeks: WeeklyChartData[] = [];
    const daysPerWeek = 7;
    const numberOfWeeks = Math.ceil(dailyData.length / daysPerWeek);
    
    for (let weekIndex = 0; weekIndex < numberOfWeeks; weekIndex++) {
      const weekStart = weekIndex * daysPerWeek;
      const weekEnd = Math.min(weekStart + daysPerWeek, dailyData.length);
      const weekDays = dailyData.slice(weekStart, weekEnd);
      
      // Aggregate data for the week
      const weekStepsMe = weekDays.reduce((sum, day) => sum + (day.me || 0), 0);
      const weekStepsPartner = weekDays.reduce((sum, day) => sum + (day.partner || 0), 0);
      
      // Average sleep and mood (only for days that have data)
      const sleepValues = weekDays.map(d => d.sleep).filter((s): s is number => s !== null && s !== undefined);
      const moodValues = weekDays.map(d => d.mood).filter((m): m is number => m !== null && m !== undefined);
      
      const avgSleep = sleepValues.length > 0 
        ? sleepValues.reduce((sum, val) => sum + val, 0) / sleepValues.length 
        : null;
      const avgMood = moodValues.length > 0 
        ? moodValues.reduce((sum, val) => sum + val, 0) / moodValues.length 
        : null;
      
      weeks.push({
        day: `Week ${weekIndex + 1}`,
        me: weekStepsMe,
        partner: weekStepsPartner,
        sleep: avgSleep,
        mood: avgMood,
      });
    }
    
    return weeks;
  }
  
  // Week view: return all days as-is (should be 7 days)
  return dailyData;
};


export const transformPantryWasteForChart = (
  pantryWaste: PantryWaste
): PantryWasteChartData[] => {
  return [
    { name: 'Active', value: pantryWaste.active, color: '#53389E' },
    { name: 'Expiring Soon', value: pantryWaste.expiring_soon, color: '#F59E0B' },
    { name: 'Deleted', value: pantryWaste.deleted, color: '#EF4444' },
  ];
};

