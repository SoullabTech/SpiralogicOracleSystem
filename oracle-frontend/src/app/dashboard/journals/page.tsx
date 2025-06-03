// File: oracle-frontend/src/app/dashboard/journals/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function JournalsDashboardPage() {
  const [journalText, setJournalText] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);
  const [pastFile, setPastFile] = useState<File | null>(null);
  const [memoryFile, setMemoryFile] = useState<File | null>(null);
  const [bioFile, setBioFile] = useState<File | null>(null);

  async function handleJournalSubmit() {
    if (!journalText.trim()) return;
    setUploading(true);
    try {
      const res = await fetch('/api/journals/entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: journalText, tags }),
      });
      setStatus(res.ok ? '✅ Journal saved!' : '❌ Save failed');
    } catch (err) {
      setStatus('❌ Error saving journal');
    } finally {
      setUploading(false);
    }
  }

  async function handlePastUpload() {
    if (!pastFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('pastJournal', pastFile);
    try {
      const res = await fetch('/api/journals/upload', {
        method: 'POST',
        body: formData,
      });
      setStatus(res.ok ? '✅ File uploaded!' : '❌ Upload failed');
    } catch (err) {
      setStatus('❌ Error uploading file');
    } finally {
      setUploading(false);
    }
  }

  async function handleMemoryUpload() {
    if (!memoryFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('memoryUpload', memoryFile);
    try {
      const res = await fetch('/api/journals/memory', {
        method: 'POST',
        body: formData,
      });
      setStatus(res.ok ? '✅ Memory added!' : '❌ Upload failed');
    } catch (err) {
      setStatus('❌ Error uploading memory');
    } finally {
      setUploading(false);
    }
  }

  async function handleBioUpload() {
    if (!bioFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('bioInsightUpload', bioFile);
    try {
      const res = await fetch('/api/journals/bio', {
        method: 'POST',
        body: formData,
      });
      setStatus(res.ok ? '✅ Bio/Insight added!' : '❌ Upload failed');
    } catch (err) {
      setStatus('❌ Error uploading bio/insight');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">📝 Journals Dashboard</h2>
      <p className="text-sm text-gray-500 mb-6">
        Write reflections, upload past entries, and deepen your relationship with your inner guide. Journals are tracked by your AI mentor.
      </p>

      <Tabs defaultValue="write" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="write">🖊️ New Entry</TabsTrigger>
          <TabsTrigger value="upload">📁 Upload Past</TabsTrigger>
          <TabsTrigger value="memory">🧠 Add Memory</TabsTrigger>
          <TabsTrigger value="bio">📊 Add Bio/Insight</TabsTrigger>
        </TabsList>

        <TabsContent value="write">
          <Textarea
            placeholder="Write your reflection, insight, or journey here..."
            value={journalText}
            onChange={e => setJournalText(e.target.value)}
            rows={10}
            className="mb-4"
          />
          <Input
            placeholder="Tags (e.g., transformation, dreams, fear, joy)"
            value={tags}
            onChange={e => setTags(e.target.value)}
            className="mb-4"
          />
          <Button onClick={handleJournalSubmit} disabled={uploading} className="w-full">
            {uploading ? 'Saving...' : 'Save Journal Entry'}
          </Button>
        </TabsContent>

        <TabsContent value="upload">
          <Input type="file" onChange={e => setPastFile(e.target.files?.[0] || null)} className="mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            Upload files from past sessions, reflections, therapy, or creative work. Your guide will integrate these into your story.
          </p>
          <Button onClick={handlePastUpload} disabled={uploading} className="w-full">
            {uploading ? 'Uploading...' : 'Upload Past File'}
          </Button>
        </TabsContent>

        <TabsContent value="memory">
          <Input type="file" onChange={e => setMemoryFile(e.target.files?.[0] || null)} className="mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            Add relevant files that help contextualize your journey—test results, health insights, reflections, or agent conversations.
          </p>
          <Button onClick={handleMemoryUpload} disabled={uploading} className="w-full">
            {uploading ? 'Uploading...' : 'Upload Memory Context'}
          </Button>
        </TabsContent>

        <TabsContent value="bio">
          <Input type="file" onChange={e => setBioFile(e.target.files?.[0] || null)} className="mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            Upload data from health apps, assessments (e.g. MBTI, StrengthsFinder), wearables, or surveys to enrich your agent’s understanding.
          </p>
          <Button onClick={handleBioUpload} disabled={uploading} className="w-full">
            {uploading ? 'Uploading...' : 'Upload Bio/Insight'}
          </Button>
        </TabsContent>
      </Tabs>

      <p className="mt-4 text-sm text-center text-gray-600">{status}</p>
    </div>
  );
}
