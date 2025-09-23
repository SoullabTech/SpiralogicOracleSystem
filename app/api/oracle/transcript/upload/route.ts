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

    let content: string;
    let metadata: any = {
      filename: file.name,
      type: file.type,
      size: file.size
    };

    // Handle different file types
    if (file.type.includes('audio')) {
      // For audio files, we'd typically send to a transcription service
      // For now, we'll store the reference
      const audioBuffer = await file.arrayBuffer();
      const audioBase64 = Buffer.from(audioBuffer).toString('base64');

      // Store audio reference
      const { data: audioData, error: audioError } = await supabase
        .from('audio_transcripts')
        .insert({
          user_id: userId,
          filename: file.name,
          audio_data: audioBase64,
          status: 'pending_transcription',
          metadata
        })
        .select()
        .single();

      if (audioError) {
        throw audioError;
      }

      // In production, trigger transcription service here
      content = `Audio file "${file.name}" uploaded for transcription. Processing in background...`;

      // Simulate transcription metadata
      metadata.transcriptionStatus = 'pending';
      metadata.duration = 'unknown';

    } else {
      // Text-based transcript
      content = await file.text();

      // Parse transcript format (common formats: VTT, SRT, plain text with timestamps)
      const parsedTranscript = parseTranscript(content);

      // Store transcript segments
      for (const segment of parsedTranscript.segments) {
        await supabase
          .from('conversation_memory')
          .insert({
            user_id: userId,
            content: segment.text,
            role: segment.speaker || 'user',
            metadata: {
              source: 'transcript_upload',
              filename: file.name,
              timestamp: segment.timestamp,
              originalFormat: parsedTranscript.format
            }
          });
      }

      metadata.format = parsedTranscript.format;
      metadata.segments = parsedTranscript.segments.length;
      metadata.duration = parsedTranscript.duration;
    }

    // Extract insights and themes from transcript
    const insights = await analyzeTranscript(content);

    // Store overall transcript record
    const { data, error } = await supabase
      .from('user_transcripts')
      .insert({
        user_id: userId,
        filename: file.name,
        content: content.substring(0, 10000), // Store first 10k chars for reference
        insights,
        metadata,
        processed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      transcriptId: data.id,
      insights,
      metadata: {
        ...metadata,
        processedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Transcript upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process transcript upload' },
      { status: 500 }
    );
  }
}

interface TranscriptSegment {
  timestamp: string;
  speaker?: string;
  text: string;
}

interface ParsedTranscript {
  format: string;
  segments: TranscriptSegment[];
  duration?: string;
}

function parseTranscript(content: string): ParsedTranscript {
  const segments: TranscriptSegment[] = [];
  let format = 'plain';

  // Check for VTT format
  if (content.startsWith('WEBVTT')) {
    format = 'vtt';
    const vttPattern = /(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})\n(.+?)(?=\n\n|\n\d{2}:|\Z)/gs;
    let match;

    while ((match = vttPattern.exec(content)) !== null) {
      segments.push({
        timestamp: match[1],
        text: match[3].trim()
      });
    }
  }
  // Check for SRT format
  else if (/^\d+\n\d{2}:\d{2}:\d{2},\d{3}/m.test(content)) {
    format = 'srt';
    const srtPattern = /\d+\n(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})\n(.+?)(?=\n\n\d+\n|\Z)/gs;
    let match;

    while ((match = srtPattern.exec(content)) !== null) {
      segments.push({
        timestamp: match[1].replace(',', '.'),
        text: match[3].trim()
      });
    }
  }
  // Check for simple timestamp format [00:00:00] or (00:00:00)
  else if (/[\[\(]\d{2}:\d{2}:\d{2}[\]\)]/m.test(content)) {
    format = 'timestamped';
    const lines = content.split('\n');

    for (const line of lines) {
      const timestampMatch = line.match(/[\[\(](\d{2}:\d{2}:\d{2})[\]\)]\s*(.+)/);
      if (timestampMatch) {
        segments.push({
          timestamp: timestampMatch[1],
          text: timestampMatch[2].trim()
        });
      }
    }
  }
  // Check for speaker labels (Name: text)
  else if (/^[A-Z][a-z]+:\s/m.test(content)) {
    format = 'dialogue';
    const lines = content.split('\n');

    for (const line of lines) {
      const speakerMatch = line.match(/^([A-Z][a-z]+):\s*(.+)/);
      if (speakerMatch) {
        segments.push({
          timestamp: new Date().toISOString(),
          speaker: speakerMatch[1],
          text: speakerMatch[2].trim()
        });
      }
    }
  }
  // Plain text - split by paragraphs
  else {
    format = 'plain';
    const paragraphs = content.split(/\n\n+/);

    paragraphs.forEach((para, index) => {
      if (para.trim()) {
        segments.push({
          timestamp: `segment_${index}`,
          text: para.trim()
        });
      }
    });
  }

  // Calculate duration if we have timestamps
  let duration;
  if (segments.length > 0 && segments[segments.length - 1].timestamp.includes(':')) {
    duration = segments[segments.length - 1].timestamp;
  }

  return {
    format,
    segments,
    duration
  };
}

async function analyzeTranscript(content: string): Promise<any> {
  // Extract key themes and insights from transcript
  const insights = {
    themes: [],
    emotionalTone: 'neutral',
    keyTopics: [],
    summary: ''
  };

  // Simple keyword analysis
  const lowerContent = content.toLowerCase();

  // Detect themes
  if (lowerContent.includes('therapy') || lowerContent.includes('healing')) {
    insights.themes.push('Therapeutic Journey');
  }
  if (lowerContent.includes('dream') || lowerContent.includes('vision')) {
    insights.themes.push('Dreams & Visions');
  }
  if (lowerContent.includes('relationship') || lowerContent.includes('connection')) {
    insights.themes.push('Relationships');
  }
  if (lowerContent.includes('growth') || lowerContent.includes('change')) {
    insights.themes.push('Personal Growth');
  }

  // Detect emotional tone
  const positiveWords = ['happy', 'joy', 'love', 'grateful', 'peace', 'calm'];
  const negativeWords = ['sad', 'anger', 'fear', 'anxious', 'worry', 'stress'];

  const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;

  if (positiveCount > negativeCount) {
    insights.emotionalTone = 'positive';
  } else if (negativeCount > positiveCount) {
    insights.emotionalTone = 'challenging';
  } else {
    insights.emotionalTone = 'balanced';
  }

  // Generate simple summary
  const words = content.split(/\s+/);
  insights.summary = `Transcript contains ${words.length} words discussing ${insights.themes.join(', ') || 'various topics'} with a ${insights.emotionalTone} emotional tone.`;

  return insights;
}