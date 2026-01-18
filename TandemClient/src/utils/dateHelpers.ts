// Date utility functions for consistent date formatting across the application


export const formatDateForAPI = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0];
};


export const formatLocalDate = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


export const getTodayUTC = (): string => {
  return formatDateForAPI(new Date());
};

