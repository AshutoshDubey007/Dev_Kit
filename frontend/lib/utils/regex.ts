/**
 * Escapes special regular expression characters in user input strings
 * to prevent ReDoS attacks and RegExp syntax errors.
 */
export function escapeRegex(input: string): string {
  if (!input) return '';
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
