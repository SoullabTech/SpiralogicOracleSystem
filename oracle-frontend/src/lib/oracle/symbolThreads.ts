// src/lib/oracle/symbolThreads.ts

/**
 * Given a list of symbols, weave them into
 * a narrative “thread.”
 */
export interface SymbolThread {
  symbol: string;
  story: string;
}

export async function symbolThreads(symbols: string[]): Promise<SymbolThread[]> {
  return symbols.map(sym => ({
    symbol: sym,
    story: `In the Spiralogic weave, "${sym}" represents a turning point in your journey—invoking deeper resonance.`
  }));
}
