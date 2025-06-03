/**
 * Concatenate class names conditionally.
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Format a date to a readable string (e.g., Jan 2, 2025).
 */
export function formatDate(date: string | number | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Truncate a string to a max length and append ellipsis.
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

/**
 * Generate a random alphanumeric ID.
 */
export function randomId(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < length; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}
