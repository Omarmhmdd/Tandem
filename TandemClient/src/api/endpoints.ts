// API endpoint constants - matches backend routes

export const ENDPOINTS = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  NUTRITION_TARGET: '/nutrition-target',

  // Household
  HOUSEHOLD_CREATE: (name: string) => `/household/create/${name}`,
  HOUSEHOLD_GET_ALL: (householdId?: string) => `/household/getAll${householdId ? `/${householdId}` : ''}`,
  HOUSEHOLD_JOIN: (code: string) => `/household/join/${code}`,
  HOUSEHOLD_INVITE_CODE: (id: string) => `/household/${id}/invite-code`,
  HOUSEHOLD_REGENERATE_INVITE_CODE: (id: string) => `/household/${id}/regenerate-invite-code`,
  HOUSEHOLD_MEMBERS: (id: string) => `/household/${id}/members`,

  // Habits
  HABITS: '/habits',
  HABIT_UPDATE: (id: string) => `/habits/${id}/update`,
  HABIT_DELETE: (id: string) => `/habits/${id}/delete`,
  HABIT_COMPLETIONS: (id: string) => `/habits/${id}/completions`,

  // Pantry
  PANTRY: '/pantry',
  PANTRY_UPDATE: (id: string) => `/pantry/${id}/update`,
  PANTRY_DELETE: (id: string) => `/pantry/${id}/delete`,

  // Recipes
  RECIPES: '/recipes',
  RECIPE: (id: string) => `/recipes/${id}`,
  RECIPE_UPDATE: (id: string) => `/recipes/${id}/update`,
  RECIPE_DELETE: (id: string) => `/recipes/${id}/delete`,

  // Goals
  GOALS: '/goals',
  GOAL_UPDATE: (id: string) => `/goals/${id}/update`,
  GOAL_DELETE: (id: string) => `/goals/${id}/delete`,
  GOAL_PROGRESS: (id: string) => `/goals/${id}/progress`,
  GOAL_MILESTONES: (id: string) => `/goals/${id}/milestones`,
  GOAL_MILESTONE_UPDATE: (id: string, milestoneId: string) => `/goals/${id}/milestones/${milestoneId}/update`,
  GOAL_MILESTONE_DELETE: (id: string, milestoneId: string) => `/goals/${id}/milestones/${milestoneId}/delete`,

  // Budget
  EXPENSES: '/budget/expenses',
  EXPENSE_UPDATE: (id: string) => `/budget/expenses/${id}/update`,
  EXPENSE_DELETE: (id: string) => `/budget/expenses/${id}/delete`,
  BUDGET_SUMMARY: '/budget/summary',
  BUDGET: '/budget',

  // Health
  HEALTH_LOGS: '/health/logs',
  HEALTH_LOG_DELETE: (id: string) => `/health/logs/${id}/delete`,
  HEALTH_LOGS_PARSE: '/health/logs/parse',

  // Meal Planner
  MEAL_PLANS: '/meals/plan',
  MEAL_PLAN_UPDATE: (id: string) => `/meals/plan/${id}/update`,
  MEAL_PLAN_DELETE: (id: string) => `/meals/plan/${id}/delete`,
  MATCH_MEALS: '/meals/match-meal',
  MATCH_MEAL_RESPOND: (id: string) => `/meals/match-meal/${id}/respond`,
  SHOPPING_LIST: (planId: string) => `/meals/shopping-list/${planId}`,

  // Mood
  MOOD_ENTRIES: '/mood/entries',
  MOOD_TIMELINE: '/mood/timeline',
  MOOD_COMPARISON: '/mood/comparison',
  MOOD_ANNOTATIONS: '/mood/annotations',

  // AI Coach
  AI_COACH_QUERY: '/ai/coach/query',
  AI_COACH_NUTRITION: '/nutrition/recommendations',  // ← CHANGE THIS

  // Weekly Summary
  WEEKLY_SUMMARIES: '/weekly-summaries',

  // Date Night
  DATE_NIGHT: '/date-night',
  DATE_NIGHT_ACCEPT: (id: string) => `/date-night/${id}/accept`,

  // Analytics
  ANALYTICS_WEEKLY: '/analytics/weekly',
  ANALYTICS_MONTHLY_MOOD: '/analytics/monthly-mood',
  ANALYTICS_PANTRY_WASTE: '/analytics/pantry-waste',
  ANALYTICS_BUDGET_CATEGORIES: '/analytics/budget-categories',

  // Auto Order
  AUTO_ORDER_PARTNERS: '/auto-order/partners',
  AUTO_ORDER_SEND: '/auto-order/send',
} as const;


