// 📁 File: src/lib/symbolMatcher.ts

/**
 * Match known symbolic keywords from a block of text (e.g., dream, journal).
 * @param input - The user-submitted text.
 * @param symbols - A list of symbols to match.
 * @returns Array of matched symbols.
 */
export function matchSymbols(input: string, symbols: string[]): string[] {
  const normalized = input.toLowerCase();
  return symbols.filter((symbol) =>
    normalized.includes(symbol.toLowerCase())
  );
}
