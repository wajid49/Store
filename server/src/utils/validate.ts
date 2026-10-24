/** Small helpers to safely read values from request bodies. */

export function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function asNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') return Number(value);
  return Number.NaN;
}

export function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
