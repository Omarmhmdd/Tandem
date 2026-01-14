import type {WeeklyAnalytics,MonthlyMood,PantryWaste,BudgetCategory,WeeklyChartData,PantryWasteChartData,BackendWeeklyAnalytics,BackendMonthlyMood,BackendPantryWaste,BackendBudgetCategory,BackendAnalyticsAggregated,AnalyticsAggregatedData,} from '../../types/analytics.types';
import type { BackendGoal } from '../../types/goal.types';
import { transformGoal } from './goalTransforms';

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
  
  // Early return if no data
  if (steps.length === 0 && sleep.length === 0 && mood.length === 0) {
    return [];
  }
  
  // Create daily data array by index (preserves chronological order)
  // Pre-allocate array size for better performance
  const maxLength = Math.max(steps.length, sleep.length, mood.length);
  const dailyData: WeeklyChartData[] = new Array(maxLength);
  
  for (let i = 0; i < maxLength; i++) {
    const step = steps[i];
    const sleepEntry = sleep[i];
    const moodEntry = mood[i];
    
    dailyData[i] = {
      day: step?.day || sleepEntry?.day || moodEntry?.day || '',
      me: step?.me ?? 0,
      partner: step?.partner ?? 0,
      sleep: sleepEntry?.hours ?? null,
      mood: moodEntry?.me ?? null,
    };
  }
  
  // If month view and we have more than 7 days, group by weeks (4 weeks)
  if (timeRange === 'month' && dailyData.length > 7) {
    const daysPerWeek = 7;
    const numberOfWeeks = Math.ceil(dailyData.length / daysPerWeek);
    const weeks: WeeklyChartData[] = new Array(numberOfWeeks);
    
    for (let weekIndex = 0; weekIndex < numberOfWeeks; weekIndex++) {
      const weekStart = weekIndex * daysPerWeek;
      const weekEnd = Math.min(weekStart + daysPerWeek, dailyData.length);
      
      // Aggregate data for the week - optimized single pass
      let weekStepsMe = 0;
      let weekStepsPartner = 0;
      let sleepSum = 0;
      let sleepCount = 0;
      let moodSum = 0;
      let moodCount = 0;
      
      for (let i = weekStart; i < weekEnd; i++) {
        const day = dailyData[i];
        weekStepsMe += day.me || 0;
        weekStepsPartner += day.partner || 0;
        
        if (day.sleep !== null && day.sleep !== undefined) {
          sleepSum += day.sleep;
          sleepCount++;
        }
        
        if (day.mood !== null && day.mood !== undefined) {
          moodSum += day.mood;
          moodCount++;
        }
      }
      
      weeks[weekIndex] = {
        day: `Week ${weekIndex + 1}`,
        me: weekStepsMe,
        partner: weekStepsPartner,
        sleep: sleepCount > 0 ? sleepSum / sleepCount : null,
        mood: moodCount > 0 ? moodSum / moodCount : null,
      };
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

/**
 * Transform aggregated analytics response from backend to frontend format
 * Reuses existing transform functions for each data type
 */
export const transformAnalyticsAggregated = (
  data: BackendAnalyticsAggregated
): AnalyticsAggregatedData => {
  return {
    weekly: transformWeeklyAnalytics(data.weekly),
    monthlyMood: transformMonthlyMood(data.monthly_mood || []),
    pantryWaste: transformPantryWaste(data.pantry_waste),
    budgetCategories: transformBudgetCategory(data.budget_categories || []),
    goals: (data.goals || []).map((goal: BackendGoal) => transformGoal(goal)),
    budgetSummary: data.budget_summary || null,
  };
};

