import { NextRequest, NextResponse } from "next/server";
import { memoryStore } from "../../../backend/src/services/memory/MemoryStore";
import { llamaService } from "../../../backend/src/services/memory/LlamaService";
import { logger } from "../../../backend/src/utils/logger";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "20", 10);
    const offset = parseInt(req.nextUrl.searchParams.get("offset") || "0", 10);

    if (!userId) {
      return NextResponse.json({ 
        error: "userId parameter is required" 
      }, { status: 400 });
    }

    // Initialize memory store
    const dbPath = process.env.MEMORY_DB_PATH || path.join(process.cwd(), 'data', 'soullab.sqlite');
    if (!memoryStore.isInitialized) {
      await memoryStore.init(dbPath);
    }

    const voiceNotes = await memoryStore.getVoiceNotes(userId, limit, offset);

    return NextResponse.json({ 
      success: true, 
      voiceNotes,
      count: voiceNotes.length
    });
  } catch (err: any) {
    logger.error("Voice notes GET error:", err);
    return NextResponse.json({ 
      error: err.message 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, transcript, audioPath, durationSeconds } = body;

    if (!userId || !transcript) {
      return NextResponse.json({ 
        error: "userId and transcript are required" 
      }, { status: 400 });
    }

    // Initialize memory services
    const dbPath = process.env.MEMORY_DB_PATH || path.join(process.cwd(), 'data', 'soullab.sqlite');
    if (!memoryStore.isInitialized) {
      await memoryStore.init(dbPath);
    }
    if (!llamaService.isInitialized) {
      await llamaService.init();
    }

    // Save voice note
    const voiceNoteId = await memoryStore.addVoiceNote(
      userId,
      transcript,
      audioPath,
      durationSeconds
    );

    // Index in LlamaIndex for semantic search
    await llamaService.addMemory(userId, {
      id: `voice_${voiceNoteId}`,
      type: "voice",
      content: transcript,
      meta: { 
        audioPath,
        duration: durationSeconds,
        timestamp: new Date().toISOString()
      },
    });

    logger.info("Voice note saved and indexed", {
      userId: userId.substring(0, 8) + '...',
      voiceNoteId,
      transcriptLength: transcript.length
    });

    return NextResponse.json({ 
      success: true, 
      voiceNoteId,
      message: "Voice note saved and indexed for Oracle memory"
    });
  } catch (err: any) {
    logger.error("Voice note POST error:", err);
    return NextResponse.json({ 
      error: err.message 
    }, { status: 500 });
  }
}