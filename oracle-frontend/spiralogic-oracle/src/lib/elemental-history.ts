interface Snapshot {
  timestamp: string;
  userId: string;
  elemental: Record<string, number>;
}

export function saveElementalSnapshot(snapshot: Snapshot) {
  const existing = JSON.parse(localStorage.getItem('elementalLog') || '[]');
  localStorage.setItem('elementalLog', JSON.stringify([snapshot, ...existing]));
}