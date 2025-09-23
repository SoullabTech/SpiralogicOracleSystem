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

    // Read file content
    const text = await file.text();

    // Parse the content to extract meaningful journal entries
    const entries = parseJournalContent(text, file.name);

    // Save each entry to the database
    const savedEntries = [];
    for (const entry of entries) {
      const { data, error } = await supabase
        .from('beta_journal_entries')
        .insert({
          explorer_id: userId,
          content: entry.content,
          prompt: entry.prompt || 'Uploaded journal entry',
          metadata: {
            source: 'upload',
            filename: file.name,
            timestamp: entry.timestamp || new Date().toISOString(),
            processed: true
          }
        })
        .select()
        .single();

      if (!error && data) {
        savedEntries.push(data);
      }
    }

    // Generate insights from the uploaded content
    const insights = await generateJournalInsights(text);

    return NextResponse.json({
      success: true,
      entriesProcessed: savedEntries.length,
      insights,
      metadata: {
        filename: file.name,
        size: file.size,
        type: file.type,
        processedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Journal upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process journal upload' },
      { status: 500 }
    );
  }
}

function parseJournalContent(text: string, filename: string) {
  const entries = [];

  // Try to detect different journal formats
  // Format 1: Date headers
  const datePattern = /^(.*?[0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4}.*?)$/gm;
  const sections = text.split(datePattern);

  if (sections.length > 1) {
    // Process date-based entries
    for (let i = 1; i < sections.length; i += 2) {
      if (sections[i] && sections[i + 1]) {
        entries.push({
          timestamp: parseDate(sections[i]),
          content: sections[i + 1].trim(),
          prompt: `Entry from ${sections[i]}`
        });
      }
    }
  } else {
    // Treat as single entry or try other patterns
    // Format 2: Markdown headers
    const markdownSections = text.split(/^#{1,3}\s+/m);

    if (markdownSections.length > 1) {
      markdownSections.slice(1).forEach((section, index) => {
        const lines = section.split('\n');
        const title = lines[0];
        const content = lines.slice(1).join('\n').trim();

        if (content) {
          entries.push({
            timestamp: new Date().toISOString(),
            content,
            prompt: title || `Section ${index + 1}`
          });
        }
      });
    } else {
      // Single entry
      entries.push({
        timestamp: new Date().toISOString(),
        content: text.trim(),
        prompt: `Uploaded from ${filename}`
      });
    }
  }

  return entries;
}

function parseDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  } catch {
    // Fall back to current date
  }
  return new Date().toISOString();
}

async function generateJournalInsights(text: string): Promise<string> {
  // This would typically call an AI service to generate insights
  // For now, return a simple analysis

  const wordCount = text.split(/\s+/).length;
  const themes = extractThemes(text);

  return `Processed ${wordCount} words. Key themes detected: ${themes.join(', ')}`;
}

function extractThemes(text: string): string[] {
  const themes = [];

  // Simple keyword detection
  const emotionalWords = ['happy', 'sad', 'anxious', 'grateful', 'love', 'fear', 'hope'];
  const growthWords = ['learning', 'growing', 'change', 'transform', 'evolve', 'develop'];
  const reflectionWords = ['realize', 'understand', 'discover', 'insight', 'awareness'];

  const lowerText = text.toLowerCase();

  if (emotionalWords.some(word => lowerText.includes(word))) {
    themes.push('Emotional Processing');
  }
  if (growthWords.some(word => lowerText.includes(word))) {
    themes.push('Personal Growth');
  }
  if (reflectionWords.some(word => lowerText.includes(word))) {
    themes.push('Self-Reflection');
  }

  if (themes.length === 0) {
    themes.push('General Reflection');
  }

  return themes;
}