/**
 * Core utility functions for formatting, class merging, and string manipulation.
 */

export type ClassValue = string | number | boolean | undefined | null | { [key: string]: any } | ClassValue[];

/**
 * Combines conditional class names into a single clean string.
 * Works standalone and handles arrays, objects, and falsy values.
 */
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  function process(input: ClassValue) {
    if (!input) return;

    if (typeof input === 'string' || typeof input === 'number') {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      input.forEach(process);
    } else if (typeof input === 'object') {
      for (const key in input) {
        if (Boolean((input as Record<string, any>)[key])) {
          classes.push(key);
        }
      }
    }
  }

  inputs.forEach(process);
  return classes.join(' ');
}

/**
 * Format currency in Indian Rupees (INR)
 * Example: 1499 -> "₹1,499"
 */
export function formatPriceINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format currency in US Dollars (USD)
 * Example: 19 -> "$19"
 */
export function formatPriceUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format ISO date string into human-readable format
 * Example: "2026-10-01" -> "Oct 1, 2026"
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Format compact numbers for stats (e.g. 1200 -> "1.2k")
 */
export function formatCompactNumber(num: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num);
}
