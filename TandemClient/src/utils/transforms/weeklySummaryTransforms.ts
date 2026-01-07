import type { WeeklySummary, BackendWeeklySummary } from '../../types/weeklySummary.types';

export const transformWeeklySummary = (summary: BackendWeeklySummary): WeeklySummary => ({
  id: summary.id,
  week_start: summary.week_start,
  highlight: summary.highlight,
  bullets: summary.bullets || [],
  action: summary.action,
  tone: summary.tone,
  created_at: summary.created_at,
});

