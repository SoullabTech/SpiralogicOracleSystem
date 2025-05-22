// src/utils/autoSave.ts
// Auto-saving conversation turns with a soft quota limit

// Maximum entries to keep in storage before dropping the oldest
const MAX_ITEMS = 100;

// Function to load existing entries (e.g. from localStorage)
function loadEntries(): any[] {
  const raw = localStorage.getItem('conversationTurns');
  return raw ? JSON.parse(raw) : [];
}

// Function to persist entries (e.g. to localStorage)
function persistEntries(entries: any[]) {
  localStorage.setItem('conversationTurns', JSON.stringify(entries));
}

// Public API to save a new turn safely
export async function saveTurn(item: any): Promise<void> {
  try {
    const entries = loadEntries(); // existing load logic
    if (entries.length >= MAX_ITEMS) {
      console.warn('autoSave: MAX_ITEMS reached, dropping oldest entry');
      entries.shift(); // remove oldest instead of throwing
    }
    entries.push(item);
    await persistEntries(entries); // existing save logic
  } catch (err: any) {
    console.warn('autoSave error (ignored):', err.message);
    // swallow the error so it can’t bubble up and crash React
  }
}
