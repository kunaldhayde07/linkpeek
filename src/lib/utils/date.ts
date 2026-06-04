import { format, formatDistanceToNow, startOfDay, endOfDay } from "date-fns";

/**
 * Format a date for display in the UI.
 */
export function formatDate(date: Date | string): string {
  return format(new Date(date), "MMM d, yyyy");
}

/**
 * Format a date with time for detailed views.
 */
export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
}

/**
 * Format a date as relative time ("2 hours ago", "3 days ago").
 */
export function formatRelative(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/**
 * Get today's date string in YYYY-MM-DD format (UTC).
 * Used for rate limit keys.
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0] as string;
}

/**
 * Get the next midnight UTC timestamp (epoch seconds).
 * Used for rate limit reset time.
 */
export function getNextMidnightUTC(): number {
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return Math.floor(tomorrow.getTime() / 1000);
}

/**
 * Get start and end of a date for database queries.
 */
export function getDateRange(date: Date): { start: Date; end: Date } {
  return {
    start: startOfDay(date),
    end: endOfDay(date),
  };
}
