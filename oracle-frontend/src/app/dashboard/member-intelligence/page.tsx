// File: oracle-frontend/src/app/dashboard/member/intelligence/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MemberIntelligenceDashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [assessmentText, setAssessmentText] = useState('');
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);

  async function handleFileUpload() {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('intelFile', file);
    formData.append('notes', notes);

    try {
      const res = await fetch('/api/intelligence/upload', {
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

  async function handleTextSubmit() {
    if (!assessmentText.trim()) return;
    setUploading(true);
    try {
      const res = await fetch('/api/intelligence/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: assessmentText, notes }),
      });
      setStatus(res.ok ? '✅ Text intelligence saved!' : '❌ Save failed');
    } catch (err) {
      setStatus('❌ Error saving intelligence');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">🧠 Member Intelligence Upload</h2>
      <p className="text-sm text-gray-500 mb-6">
        Upload test results, health data, or self-assessments to expand your agent's insight field. This dashboard supports Myers-Briggs, Enneagram, StrengthsFinder, Apple/Android Health, biofeedback, and more.
      </p>

      <Tabs defaultValue="file" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="file">📁 Upload File</TabsTrigger>
          <TabsTrigger value="text">📝 Paste Results</TabsTrigger>
        </TabsList>

        <TabsContent value="file">
          <Input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="mb-4" />
          <Textarea
            placeholder="Optional: Add insights or notes here..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="mb-4"
          />
          <Button onClick={handleFileUpload} disabled={uploading} className="w-full">
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
        </TabsContent>

        <TabsContent value="text">
          <Textarea
            placeholder="Paste MBTI, Enneagram, biofeedback summaries, or any assessment data..."
            value={assessmentText}
            onChange={e => setAssessmentText(e.target.value)}
            rows={8}
            className="mb-4"
          />
          <Textarea
            placeholder="Optional: Add context or reflections here..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="mb-4"
          />
          <Button onClick={handleTextSubmit} disabled={uploading} className="w-full">
            {uploading ? 'Saving...' : 'Save Intelligence'}
          </Button>
        </TabsContent>
      </Tabs>

      <p className="mt-4 text-sm text-center text-gray-600">{status}</p>
    </div>
  );
}
