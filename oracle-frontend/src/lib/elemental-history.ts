// File: oracle-frontend/src/lib/elemental-history.ts

const STORAGE_KEY = 'elementalTrendHistory';

export interface ElementalSnapshot {
  timestamp: string;
  userId: string;
  elemental: Record<string, number>;
}

export function saveElementalSnapshot(snapshot: ElementalSnapshot) {
  const existing = getElementalHistory();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([snapshot, ...existing]));
}

export function getElementalHistory(): ElementalSnapshot[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearElementalHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
