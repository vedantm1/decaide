import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with tailwind-merge to avoid class conflicts
 * @param inputs Class values to be merged
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number according to the specified locale and options
 * @param value Number to format
 * @param options Intl.NumberFormatOptions
 * @param locale Locale to use for formatting
 * @returns Formatted number string
 */
export function formatNumber(
  value: number,
  options: Intl.NumberFormatOptions = {},
  locale = "en-US"
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Formats a date according to the specified locale and options
 * @param date Date to format
 * @param options Intl.DateTimeFormatOptions
 * @param locale Locale to use for formatting
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = { 
    month: "short", 
    day: "numeric", 
    year: "numeric" 
  },
  locale = "en-US"
): string {
  const d = typeof date === "string" || typeof date === "number" 
    ? new Date(date) 
    : date;
  
  return new Intl.DateTimeFormat(locale, options).format(d);
}

/**
 * Truncates a string to the specified length and adds an ellipsis
 * @param str String to truncate
 * @param length Maximum length of the string
 * @returns Truncated string
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

/**
 * Generates an array of numbers from start to end (inclusive)
 * @param start Start number
 * @param end End number
 * @returns Array of numbers
 */
export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * Debounces a function to prevent it from being called too frequently
 * @param fn Function to debounce
 * @param ms Milliseconds to delay
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  ms = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Generates a random string of the specified length
 * @param length Length of the string
 * @returns Random string
 */
export function randomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => 
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}

/**
 * Safely parses JSON without throwing an error
 * @param json JSON string to parse
 * @param fallback Fallback value if parsing fails
 * @returns Parsed JSON or fallback
 */
export function safeParseJSON<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    return fallback;
  }
}

/**
 * Waits for the specified number of milliseconds
 * @param ms Milliseconds to wait
 * @returns Promise that resolves after the specified time
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}