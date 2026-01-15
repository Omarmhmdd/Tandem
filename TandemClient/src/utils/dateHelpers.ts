// Date utility functions for consistent date formatting across the application

/**
 * Formats a date as YYYY-MM-DD in UTC timezone (for backend API)
 * This ensures consistency with backend validation that uses UTC dates
 */
export const formatDateForAPI = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Formats a date as YYYY-MM-DD in local timezone (for display/filtering)
 * Use this when you need the user's local date, not UTC
 */
export const formatLocalDate = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Gets today's date in UTC format (YYYY-MM-DD) for API calls
 */
export const getTodayUTC = (): string => {
  return formatDateForAPI(new Date());
};

