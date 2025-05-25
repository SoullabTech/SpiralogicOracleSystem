// src/lib/oracle/extractSymbols.ts

/**
 * Extract “symbols” from a piece of text.
 * For demo purposes this just returns every
 * capitalized word as a “symbol.”
 */
export async function extractSymbols(text: string): Promise<string[]> {
  // simple regex: words that start with uppercase letter
  const matches = Array.from(text.matchAll(/\b[A-Z][a-zA-Z0-9]+\b/g));
  // dedupe
  const unique = Array.from(new Set(matches.map(m => m[0])));
  return unique;
}