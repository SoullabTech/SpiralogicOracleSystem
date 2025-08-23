import { z } from 'zod';

// Minimal shape we actually read from
export type BadgeConstellation = {
  name?: string;
  code?: string;
  // allow extra fields without fuss
  [k: string]: unknown;
};

// "could be one, many, or absent"
export type BadgeConstellations =
  | BadgeConstellation
  | BadgeConstellation[]
  | null
  | undefined;

// Zod schema for runtime validation
export const BadgeConstellationSchema = z.object({
  name: z.string().optional(),
  code: z.string().optional(),
}).passthrough();

export const BadgeConstellationsSchema = z.union([
  BadgeConstellationSchema,
  z.array(BadgeConstellationSchema),
  z.null(),
  z.undefined(),
]);

/** Safe name getter with fallback */
export function getConstellationName(
  input: BadgeConstellations,
  fallback?: string
) {
  if (Array.isArray(input)) return input[0]?.name ?? fallback;
  return (input as BadgeConstellation | undefined)?.name ?? fallback;
}

/** Production-safe version with runtime guard */
export function getConstellationNameStrict(
  input: BadgeConstellations,
  fallback = '—'
) {
  try {
    return getConstellationName(input, fallback);
  } catch {
    return fallback;
  }
}

// Optional utility types for other "maybe array" shapes
export type Nullable<T> = T | null | undefined;
export type MaybeArray<T> = T | T[];
export type MaybeArrayNullable<T> = Nullable<MaybeArray<T>>;

/** Generic helper for "object or array" patterns - gets first item or the item itself */
export function maybeArrayFirst<T>(
  input: T | T[] | null | undefined
): T | undefined {
  if (Array.isArray(input)) return input[0];
  return input || undefined;
}

/** Generic helper with property access */
export function maybeArrayFirstProp<T, K extends keyof T>(
  input: T | T[] | null | undefined,
  prop: K,
  fallback?: T[K]
): T[K] | typeof fallback {
  const first = maybeArrayFirst(input);
  return first?.[prop] ?? fallback;
}