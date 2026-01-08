export interface LogEntry {
  id: string;
  date: string;
  time: string;
  activities: string[];
  food: string[];
  sleep?: {
    hours: number;
    bedtime?: string;
    wakeTime?: string;
  };
  mood: string;
  notes?: string;
}


export type MoodType = 'happy' | 'calm' | 'tired' | 'anxious' | 'sad' | 'energized' | 'neutral';

// Backend types (snake_case from API)
export interface BackendHealthLog {
  id: number | string;
  date: string;
  time: string;
  activities: string[];
  food: string[];
  sleep_hours?: number;
  bedtime?: string;
  wake_time?: string;
  mood: string;
  notes?: string;
}

// Parsed log response type
export interface ParsedHealthLog {
  activities: string[];
  food: string[];
  sleep_hours: number | null;
  bedtime: string | null;
  wake_time: string | null;
  mood: string;
  notes: string;
  confidence: number;
  complement: string;
}

// API Response types
export interface HealthLogsResponse {
  data: {
    logs: BackendHealthLog[];
  };
  message?: string;
}

export interface SingleHealthLogResponse {
  data: {
    log: BackendHealthLog;
  };
  message?: string;
}

export interface ParseHealthLogResponse {
  data: {
    parsed: ParsedHealthLog;
  };
  message?: string;
}

export interface HealthLoggerProps {
  onSave?: (entry: Omit<LogEntry, 'id'> & { confidence?: number; originalText?: string }) => void;
}
export interface UseHealthLogParserOptions {
  selectedMood?: string;
}