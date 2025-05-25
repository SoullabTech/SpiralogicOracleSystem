'use client';
import DreamRecorderModal from '@/components/dreams/DreamRecorderModal';

export default function DreamEntryPage() {
  return <DreamRecorderModal onClose={() => window.history.back()} />;
}
