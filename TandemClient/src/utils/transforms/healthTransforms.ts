import type { LogEntry, BackendHealthLog ,ParsedHealthLog} from '../../types/health.types';

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

// Frontend → Backend (ADD THIS)
export const transformHealthLogToBackend = (
  entry: Omit<LogEntry, 'id'> & { confidence?: number; originalText?: string }
): Omit<BackendHealthLog, 'id'> & { confidence?: number; original_text?: string | null } => {
  return {
    date: entry.date,
    time: entry.time,
    activities: Array.isArray(entry.activities) ? entry.activities : [],
    food: Array.isArray(entry.food) ? entry.food : [],
    sleep_hours: entry.sleep?.hours || undefined,
    bedtime: entry.sleep?.bedtime || undefined,
    wake_time: entry.sleep?.wakeTime || undefined,
    mood: entry.mood,
    notes: entry.notes || undefined,
    confidence: entry.confidence || 0.95,
    original_text: entry.originalText || entry.notes || null,
  };
};

export const buildQueryString = (startDate?: string, endDate?: string): string => {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  const query = params.toString();
  return query ? `?${query}` : '';
};




export const transformParsedToEntry = (
  parsed: ParsedHealthLog,
  selectedMood?: string,
  originalText?: string
): Omit<LogEntry, 'id'> & { confidence?: number; originalText?: string } => {
  return {
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    activities: parsed.activities || [],
    food: parsed.food || [],
    sleep: parsed.sleep_hours ? { 
      hours: parsed.sleep_hours,
      bedtime: parsed.bedtime || undefined,
      wakeTime: parsed.wake_time || undefined,
    } : undefined,
    mood: selectedMood || parsed.mood || 'neutral',
    notes: parsed.notes || '',
    confidence: parsed.confidence || 0.95,
    originalText: originalText || '',
  };
};