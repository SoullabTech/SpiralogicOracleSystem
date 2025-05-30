// 📁 src/lib/journalStore.ts
const mockJournal = [
    {
        date: '2025-05-20',
        theme: 'Flight through starlight',
        archetype: 'Visionary',
        symbol: '🦋',
        message: 'You are being invited to transcend limits and dance with freedom.',
    },
    {
        date: '2025-05-18',
        theme: 'Labyrinth and Mirror',
        archetype: 'Shadow',
        symbol: '🜃',
        message: 'Face what has been hidden, and you will find clarity.',
    },
];
export function getJournalEntries(userId) {
    // Eventually replace with database or Supabase fetch
    return mockJournal;
}
