// oracle-frontend/src/app/journal/page.tsx

import { JournalList } from '@/components/JournalList';

export default function JournalPage() {
  return (
    <main className="prose mx-auto py-8">
      <h1>Your Voice Journal</h1>
      <JournalList />
    </main>
  );
}
