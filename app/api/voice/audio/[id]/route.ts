import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { memoryStore } from "@/backend/src/services/memory/MemoryStore";
import { logger } from "@/backend/src/utils/logger";

/**
 * GET /api/voice/audio/[id]
 * Serves the audio file for a voice note
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const voiceNoteId = parseInt(params.id);
    
    if (isNaN(voiceNoteId)) {
      return NextResponse.json(
        { error: "Invalid voice note ID" },
        { status: 400 }
      );
    }

    // Initialize memory store if needed
    if (!memoryStore.isInitialized) {
      const dbPath = path.join(process.cwd(), "backend", "src", "services", "memory", "soullab.sqlite");
      await memoryStore.init(dbPath);
    }

    // Get voice note from database
    const voiceNote = await memoryStore.getVoiceNote(voiceNoteId);
    
    if (!voiceNote || !voiceNote.audio_path) {
      return NextResponse.json(
        { error: "Voice note not found or no audio available" },
        { status: 404 }
      );
    }

    // Check if file exists
    try {
      await fs.access(voiceNote.audio_path);
    } catch {
      logger.error("Audio file not found on disk", {
        voiceNoteId,
        audioPath: voiceNote.audio_path
      });
      return NextResponse.json(
        { error: "Audio file not found" },
        { status: 404 }
      );
    }

    // Read the audio file
    const audioBuffer = await fs.readFile(voiceNote.audio_path);
    
    // Determine content type based on file extension
    const ext = path.extname(voiceNote.audio_path).toLowerCase();
    const contentType = {
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.m4a': 'audio/mp4',
      '.webm': 'audio/webm',
      '.ogg': 'audio/ogg'
    }[ext] || 'audio/mpeg';

    // Return audio file with proper headers
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600',
        'Content-Disposition': `inline; filename="voice-${voiceNoteId}${ext}"`
      }
    });

  } catch (error: any) {
    logger.error("Error serving audio file", {
      error: error.message,
      voiceNoteId: params.id
    });

    return NextResponse.json(
      { error: "Failed to serve audio file" },
      { status: 500 }
    );
  }
}