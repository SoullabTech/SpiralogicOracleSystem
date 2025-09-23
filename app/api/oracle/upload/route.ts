import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'Missing file or userId' },
        { status: 400 }
      );
    }

    // Route to specific handlers based on file type
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();

    // Journal files (.txt, .md, or text content)
    if (fileName.includes('journal') ||
        fileName.endsWith('.md') ||
        (fileName.endsWith('.txt') && !fileName.includes('transcript'))) {
      return redirectToJournalUpload(req);
    }

    // Transcript files (audio or transcript text)
    if (fileType.includes('audio') ||
        fileName.includes('transcript') ||
        fileName.endsWith('.vtt') ||
        fileName.endsWith('.srt')) {
      return redirectToTranscriptUpload(req);
    }

    // PDF documents
    if (fileType === 'application/pdf') {
      return handlePDFUpload(file, userId);
    }

    // JSON data (could be exported data, settings, etc)
    if (fileType === 'application/json' || fileName.endsWith('.json')) {
      return handleJSONUpload(file, userId);
    }

    // CSV data (could be tracking data, logs, etc)
    if (fileType === 'text/csv' || fileName.endsWith('.csv')) {
      return handleCSVUpload(file, userId);
    }

    // Default: Store as general document
    return handleGeneralUpload(file, userId);

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}

async function redirectToJournalUpload(req: NextRequest) {
  // Forward to journal upload endpoint
  const url = new URL('/api/oracle/journal/upload', req.url);
  return fetch(url, {
    method: 'POST',
    body: await req.formData()
  });
}

async function redirectToTranscriptUpload(req: NextRequest) {
  // Forward to transcript upload endpoint
  const url = new URL('/api/oracle/transcript/upload', req.url);
  return fetch(url, {
    method: 'POST',
    body: await req.formData()
  });
}

async function handlePDFUpload(file: File, userId: string) {
  // For PDFs, we'd typically extract text or send to a PDF processing service
  // For now, store the reference
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');

  const { data, error } = await supabase
    .from('user_documents')
    .insert({
      user_id: userId,
      filename: file.name,
      file_type: 'pdf',
      file_size: file.size,
      content_preview: 'PDF document awaiting processing',
      metadata: {
        uploadedAt: new Date().toISOString(),
        status: 'pending_processing'
      }
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return NextResponse.json({
    success: true,
    documentId: data.id,
    insights: 'PDF document uploaded successfully. Content extraction queued.',
    metadata: {
      filename: file.name,
      size: file.size,
      type: 'pdf',
      processedAt: new Date().toISOString()
    }
  });
}

async function handleJSONUpload(file: File, userId: string) {
  const content = await file.text();
  let jsonData;

  try {
    jsonData = JSON.parse(content);
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON format' },
      { status: 400 }
    );
  }

  // Detect JSON structure type
  let dataType = 'generic';
  let insights = '';

  // Check if it's exported Maya data
  if (jsonData.maya_version || jsonData.explorerData) {
    dataType = 'maya_export';
    insights = await importMayaData(jsonData, userId);
  }
  // Check if it's chat history
  else if (Array.isArray(jsonData) && jsonData[0]?.role) {
    dataType = 'chat_history';
    insights = await importChatHistory(jsonData, userId);
  }
  // Check if it's journal entries
  else if (jsonData.entries || (Array.isArray(jsonData) && jsonData[0]?.content)) {
    dataType = 'journal_export';
    insights = await importJournalEntries(jsonData, userId);
  }

  // Store the import record
  const { data, error } = await supabase
    .from('data_imports')
    .insert({
      user_id: userId,
      filename: file.name,
      data_type: dataType,
      record_count: Array.isArray(jsonData) ? jsonData.length : Object.keys(jsonData).length,
      metadata: {
        importedAt: new Date().toISOString(),
        originalStructure: Object.keys(jsonData).slice(0, 10) // Store first 10 keys for reference
      }
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return NextResponse.json({
    success: true,
    importId: data.id,
    dataType,
    insights,
    metadata: {
      filename: file.name,
      recordsProcessed: Array.isArray(jsonData) ? jsonData.length : 1,
      processedAt: new Date().toISOString()
    }
  });
}

async function handleCSVUpload(file: File, userId: string) {
  const content = await file.text();
  const lines = content.split('\n');
  const headers = lines[0]?.split(',').map(h => h.trim());
  const rowCount = lines.length - 1;

  // Store CSV data for processing
  const { data, error } = await supabase
    .from('data_imports')
    .insert({
      user_id: userId,
      filename: file.name,
      data_type: 'csv',
      record_count: rowCount,
      metadata: {
        headers,
        importedAt: new Date().toISOString()
      }
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return NextResponse.json({
    success: true,
    importId: data.id,
    insights: `CSV data with ${rowCount} rows and columns: ${headers?.join(', ')}`,
    metadata: {
      filename: file.name,
      rows: rowCount,
      columns: headers,
      processedAt: new Date().toISOString()
    }
  });
}

async function handleGeneralUpload(file: File, userId: string) {
  const content = await file.text();

  // Store general document
  const { data, error } = await supabase
    .from('user_documents')
    .insert({
      user_id: userId,
      filename: file.name,
      file_type: file.type || 'unknown',
      file_size: file.size,
      content_preview: content.substring(0, 500),
      metadata: {
        uploadedAt: new Date().toISOString()
      }
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return NextResponse.json({
    success: true,
    documentId: data.id,
    insights: 'Document uploaded and indexed for future reference.',
    metadata: {
      filename: file.name,
      size: file.size,
      type: file.type,
      processedAt: new Date().toISOString()
    }
  });
}

// Helper functions for specific data imports
async function importMayaData(data: any, userId: string): Promise<string> {
  // Import Maya-specific data structures
  let imported = 0;

  if (data.conversations) {
    for (const conv of data.conversations) {
      await supabase.from('conversation_memory').insert({
        user_id: userId,
        content: conv.content,
        role: conv.role,
        metadata: { ...conv.metadata, imported: true }
      });
      imported++;
    }
  }

  if (data.explorerProfile) {
    await supabase.from('user_profiles').upsert({
      user_id: userId,
      ...data.explorerProfile
    });
  }

  return `Imported ${imported} Maya conversation records and profile data.`;
}

async function importChatHistory(messages: any[], userId: string): Promise<string> {
  let imported = 0;

  for (const msg of messages) {
    const { error } = await supabase.from('conversation_memory').insert({
      user_id: userId,
      content: msg.content || msg.text,
      role: msg.role || 'user',
      metadata: {
        imported: true,
        originalTimestamp: msg.timestamp || msg.created_at
      }
    });

    if (!error) imported++;
  }

  return `Imported ${imported} chat messages into your conversation history.`;
}

async function importJournalEntries(data: any, userId: string): Promise<string> {
  const entries = Array.isArray(data) ? data : (data.entries || []);
  let imported = 0;

  for (const entry of entries) {
    const { error } = await supabase.from('beta_journal_entries').insert({
      explorer_id: userId,
      content: entry.content || entry.text,
      prompt: entry.prompt || entry.title || 'Imported entry',
      metadata: {
        imported: true,
        originalDate: entry.date || entry.timestamp || entry.created_at
      }
    });

    if (!error) imported++;
  }

  return `Imported ${imported} journal entries into your sacred archive.`;
}