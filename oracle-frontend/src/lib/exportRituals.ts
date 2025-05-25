// lib/exportRituals.ts
export function exportRitualLog(entries: { date: string; element: string; ritual: string }[]) {
  const text = entries
    .map(e => `📅 ${e.date}\n🔹 ${e.element}: ${e.ritual}\n`)
    .join('\n');

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'Spiralogic_Ritual_Log.txt';
  a.click();
}
