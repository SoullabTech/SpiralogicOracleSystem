export function analyzeElementalTrend(journalSummary: string): Record<string, number> {
  // Placeholder logic for demo - could analyze journalSummary for actual trends
  const baseValue = journalSummary.length > 0 ? 0.5 : 0.3;
  return {
    fire: Math.random() * 0.5 + baseValue,
    water: Math.random() * 0.5 + baseValue,
    earth: Math.random() * 0.5 + baseValue,
    air: Math.random() * 0.5 + baseValue,
  };
}