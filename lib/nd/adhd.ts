export function attentionHint(text: string): "anchor"|"loop"|"spark"|"worry" {
  const t = text.toLowerCase();
  if (/\b(anxious|worried|fear|concern|panic)\b/.test(t)) return "worry";
  if (/\bagain|still|stuck|loop\b/.test(t)) return "loop";
  if (/\bidea|inspire|spark|aha|noted\b/.test(t)) return "spark";
  return "anchor";
}

export function suggestRecallMins(hint: ReturnType<typeof attentionHint>): number {
  switch(hint){
    case "spark": return 90;
    case "worry": return 45;
    case "loop":  return 120;
    default:      return 240;
  }
}