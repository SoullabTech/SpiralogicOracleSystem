// File: oracle-frontend/src/app/dashboard/journal/upload/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

export default function MemoryUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);
  const [textMemory, setTextMemory] = useState('');

  async function handleFileUpload() {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('memoryFile', file);
    formData.append('description', description);

    try {
      const res = await fetch('/api/memory/upload', {
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
    if (!textMemory.trim()) return;
    setUploading(true);
    try {
      const res = await fetch('/api/memory/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: textMemory, description }),
      });
      setStatus(res.ok ? '✅ Text memory saved!' : '❌ Save failed');
    } catch (err) {
      setStatus('❌ Error saving memory');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">📚 Memory Uploads</h2>
      <p className="text-sm text-gray-500 mb-6">
        Upload or paste past sessions, voice transcripts, journals, or notes. Your oracle agent will use these to deepen context and enhance insight.
      </p>

      <Tabs defaultValue="file" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="file">📂 Upload File</TabsTrigger>
          <TabsTrigger value="text">✍️ Paste Text</TabsTrigger>
        </TabsList>

        <TabsContent value="file">
          <Input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="mb-4" />
          <Textarea
            placeholder="Add a short description or notes for context..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="mb-4"
          />
          <Button onClick={handleFileUpload} disabled={uploading} className="w-full">
            {uploading ? 'Uploading...' : 'Upload File Memory'}
          </Button>
        </TabsContent>

        <TabsContent value="text">
          <Textarea
            placeholder="Paste or write memory journal entry here..."
            value={textMemory}
            onChange={e => setTextMemory(e.target.value)}
            rows={8}
            className="mb-4"
          />
          <Textarea
            placeholder="Add a short description or notes for context..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="mb-4"
          />
          <Button onClick={handleTextSubmit} disabled={uploading} className="w-full">
            {uploading ? 'Saving...' : 'Save Text Memory'}
          </Button>
        </TabsContent>
      </Tabs>

      <p className="mt-4 text-sm text-center text-gray-600">{status}</p>

      <div className="mt-6 text-sm text-center">
        <p className="font-semibold mb-2">🔮 Explore More Dashboards:</p>
        <div className="flex flex-col gap-2 items-center">
          <Link href="/dashboard/astrology" className="text-blue-600 hover:underline">🪐 Astrology Insights</Link>
          <Link href="/dashboard/agents" className="text-blue-600 hover:underline">🤖 Oracle Agents</Link>
          <Link href="/dashboard/holoflower" className="text-blue-600 hover:underline">🌸 Holoflower Visuals</Link>
          <Link href="/dashboard/journal" className="text-blue-600 hover:underline">📓 Journals & Memories</Link>
          <Link href="/dashboard/experiments" className="text-blue-600 hover:underline">🧪 Experimental Interfaces</Link>
        </div>
      </div>
    </div>
  );
}
