import type { LogEntry, BackendHealthLog } from '../../types/health.types';

export const transformHealthLog = (log: BackendHealthLog): LogEntry => ({
  id: String(log.id),
  date: log.date,
  time: log.time,
  activities: log.activities || [],
  food: log.food || [],
  sleep: log.sleep_hours ? {
    hours: log.sleep_hours,
    bedtime: log.bedtime || undefined,
    wakeTime: log.wake_time || undefined,
  } : undefined,
  mood: log.mood,
  notes: log.notes || undefined,
});

export const buildQueryString = (startDate?: string, endDate?: string): string => {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  const query = params.toString();
  return query ? `?${query}` : '';
};

