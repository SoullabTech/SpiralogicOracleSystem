// src/services/oracleService.ts

export const oracleService = {
  ask: (question: string): string => {
    return `The Oracle hears your question: "${question}"... and responds in silence.`;
  },

  interpretSymbols: (symbols: string[]): string => {
    return `These symbols—${symbols.join(', ')}—hold keys to your current transformation.`;
  },
};
