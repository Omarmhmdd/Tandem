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
  used: data.used || 0,
  wasted: data.wasted || 0,
  donated: data.donated || 0,
  totalItems: data.total_items || 0,
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
  weeklyAnalytics: WeeklyAnalytics
): WeeklyChartData[] => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const stepsMap = new Map(
    (weeklyAnalytics.steps || []).map((s) => [s.day, s])
  );
  const sleepMap = new Map(
    (weeklyAnalytics.sleep || []).map((s) => [s.day, s])
  );
  const moodMap = new Map(
    (weeklyAnalytics.mood || []).map((m) => [m.day, m])
  );

  return days.map((day) => {
    const steps = stepsMap.get(day) || { me: 0, partner: 0 };
    const sleep = sleepMap.get(day) || { hours: null };
    const mood = moodMap.get(day) || { me: 0, partner: 0 };

    return {
      day,
      me: steps.me || 0,
      partner: steps.partner || 0,
      sleep: sleep.hours ?? 0,
      mood: mood.me || 0,
    };
  });
};


export const transformPantryWasteForChart = (
  pantryWaste: PantryWaste
): PantryWasteChartData[] => {
  return [
    { name: 'Used', value: pantryWaste.used, color: '#53389E' },
    { name: 'Wasted', value: pantryWaste.wasted, color: '#EF4444' },
    { name: 'Donated', value: pantryWaste.donated, color: '#10B981' },
  ];
};

