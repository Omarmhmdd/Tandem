/**
 * Weekly Summary feature types
 */

// Frontend types (camelCase)
export interface WeeklySummary {
  id: number;  // Keep as number - backend returns integer
  week_start: string;
  highlight: string;
  bullets: string[];
  action: string;
  tone: 'encouraging' | 'supportive' | 'motivational';
  created_at: string;
}

// Backend types (snake_case from API) - same as frontend for this feature
export interface BackendWeeklySummary {
  id: number;  // Backend returns integer
  week_start: string;
  highlight: string;
  bullets: string[];
  action: string;
  tone: 'encouraging' | 'supportive' | 'motivational';
  created_at: string;
}

// API Response types
export interface WeeklySummariesResponse {
  data: {
    summaries: BackendWeeklySummary[];
  };
  message?: string;
}

export interface SingleWeeklySummaryResponse {
  data: {
    summary: BackendWeeklySummary;
  };
  message?: string;
}