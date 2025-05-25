// oracle-backend/server/tasks/loadShadowData.ts
import fs from 'fs';
import path from 'path';

export function loadShadowEvolutionJSON() {
  const filePath = path.join(process.cwd(), 'oracle-backend', 'spiralogic_kb', 'shadow_evolution.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}
