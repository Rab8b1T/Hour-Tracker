import { format, addDays, startOfWeek, endOfWeek, parseISO } from 'date-fns';

// Format date as YYYY-MM-DD for inputs
export function formatDateForInput(date) {
  return format(date instanceof Date ? date : new Date(date), 'yyyy-MM-dd');
}

// Format date as readable string (e.g., April 13, 2023)
export function formatReadableDate(date) {
  return format(date instanceof Date ? date : new Date(date), 'MMMM d, yyyy');
}

// Get the current date in YYYY-MM-DD format
export function getCurrentDate() {
  return formatDateForInput(new Date());
}

// Get the start of the week (Sunday) containing the given date
export function getWeekStart(date = new Date()) {
  return startOfWeek(date instanceof Date ? date : new Date(date));
}

// Get current week's start date in YYYY-MM-DD format
export function getCurrentWeekStart() {
  return formatDateForInput(getWeekStart());
}

// Calculate the end date of a week (Saturday) given the start date
export function getWeekEnd(startDate) {
  const start = startDate instanceof Date ? startDate : parseISO(startDate);
  return addDays(start, 6);
}

// Format a week date range for display (e.g., "April 13 - April 19, 2023")
export function formatWeekRange(startDate) {
  const start = startDate instanceof Date ? startDate : parseISO(startDate);
  const end = getWeekEnd(start);
  
  // If same month and year
  if (format(start, 'MMMM yyyy') === format(end, 'MMMM yyyy')) {
    return `${format(start, 'MMMM d')} - ${format(end, 'd, yyyy')}`;
  }
  
  // If same year but different month
  if (format(start, 'yyyy') === format(end, 'yyyy')) {
    return `${format(start, 'MMMM d')} - ${format(end, 'MMMM d, yyyy')}`;
  }
  
  // Different years
  return `${format(start, 'MMMM d, yyyy')} - ${format(end, 'MMMM d, yyyy')}`;
}

// Helper to create a date range for database queries
export function createDateRange(dateStr) {
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  
  const startDate = new Date(date);
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);
  
  return { startDate, endDate };
}

// Create a week date range for database queries
export function createWeekRange(startDateStr) {
  const startDate = new Date(startDateStr);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6); // 7 days total (start + 6)
  endDate.setHours(23, 59, 59, 999);
  
  return { startDate, endDate };
}