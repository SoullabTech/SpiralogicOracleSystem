// File: oracle-frontend/src/app/dashboard/astrology/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AstrologyDashboardPage() {
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);
  const [archetypalNote, setArchetypalNote] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthLocation, setBirthLocation] = useState('');
  const [externalDataFile, setExternalDataFile] = useState<File | null>(null);

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('chartFile', file);
    formData.append('description', description);
    formData.append('birthDate', birthDate);
    formData.append('birthTime', birthTime);
    formData.append('birthLocation', birthLocation);

    try {
      const res = await fetch('/api/astrology/upload', {
        method: 'POST',
        body: formData,
      });
      setStatus(res.ok ? '✅ Chart uploaded!' : '❌ Upload failed');
    } catch (err) {
      setStatus('❌ Error uploading chart');
    } finally {
      setUploading(false);
    }
  }

  async function handleNoteSubmit() {
    if (!archetypalNote.trim()) return;
    setUploading(true);
    try {
      const res = await fetch('/api/astrology/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note: archetypalNote,
          description,
          birthDate,
          birthTime,
          birthLocation,
        }),
      });
      setStatus(res.ok ? '✅ Note saved!' : '❌ Save failed');
    } catch (err) {
      setStatus('❌ Error saving note');
    } finally {
      setUploading(false);
    }
  }

  async function handleExternalUpload() {
    if (!externalDataFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('externalData', externalDataFile);
    try {
      const res = await fetch('/api/intelligence/upload', {
        method: 'POST',
        body: formData,
      });
      setStatus(res.ok ? '✅ External data uploaded!' : '❌ Upload failed');
    } catch (err) {
      setStatus('❌ Error uploading external data');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">🪐 Spiralogic Astrology Dashboard</h2>
      <p className="text-sm text-gray-500 mb-6">
        Upload natal charts, external intelligence, and add archetypal notes. Your AI guide uses this to personalize timing, purpose, and transformation.
      </p>

      <Tabs defaultValue="chart" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="chart">📁 Upload Chart</TabsTrigger>
          <TabsTrigger value="insight">✨ Add Insight</TabsTrigger>
          <TabsTrigger value="external">📊 Upload Intelligence</TabsTrigger>
        </TabsList>

        <TabsContent value="chart">
          <Input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="mb-4" />
          <Input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="mb-2" />
          <Input type="time" value={birthTime} onChange={e => setBirthTime(e.target.value)} className="mb-2" />
          <Input type="text" value={birthLocation} onChange={e => setBirthLocation(e.target.value)} className="mb-4" placeholder="Birth Location" />
          <Textarea
            placeholder="Add a description (e.g., natal, solar return, transit)..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="mb-4"
          />
          <Button onClick={handleUpload} disabled={uploading} className="w-full">
            {uploading ? 'Uploading...' : 'Upload Astrological Chart'}
          </Button>
        </TabsContent>

        <TabsContent value="insight">
          <Textarea
            placeholder="Write about planetary insights, archetypal guides, or current transits..."
            value={archetypalNote}
            onChange={e => setArchetypalNote(e.target.value)}
            rows={8}
            className="mb-4"
          />
          <Input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="mb-2" />
          <Input type="time" value={birthTime} onChange={e => setBirthTime(e.target.value)} className="mb-2" />
          <Input type="text" value={birthLocation} onChange={e => setBirthLocation(e.target.value)} className="mb-4" placeholder="Birth Location" />
          <Textarea
            placeholder="Optional description or chart reference..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="mb-4"
          />
          <Button onClick={handleNoteSubmit} disabled={uploading} className="w-full">
            {uploading ? 'Saving...' : 'Save Archetypal Note'}
          </Button>
        </TabsContent>

        <TabsContent value="external">
          <Input type="file" onChange={e => setExternalDataFile(e.target.files?.[0] || null)} className="mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            Upload reports or data from other systems (e.g., biofeedback, MBTI, StrengthsFinder, wearable data, Human Design, Apple Health, etc.)
          </p>
          <Button onClick={handleExternalUpload} disabled={uploading} className="w-full">
            {uploading ? 'Uploading...' : 'Upload External Intelligence'}
          </Button>
        </TabsContent>
      </Tabs>

      <p className="mt-4 text-sm text-center text-gray-600">{status}</p>
    </div>
  );
}
