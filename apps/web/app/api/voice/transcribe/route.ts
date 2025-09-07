import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
// Removed backend dependencies that cause SQLite errors in Next.js context
// import { memoryStore } from "@/backend/src/services/memory/MemoryStore";
// import { llamaService } from "@/backend/src/services/memory/LlamaService";
import OpenAI from "openai";


// Stub memory store
const memoryStore = {
  isInitialized: false,
  init: async (dbPath: string) => {},
  getMemories: async (userId: string, limit: number) => [],
  getJournalEntries: async (userId: string, limit: number) => [],
  getUploads: async (userId: string, limit: number) => [],
  getVoiceNotes: async (userId: string, limit: number) => [],
  getVoiceNote: async (id: string) => null,
  saveVoiceNote: async (data: any) => ({ id: Date.now().toString(), ...data }),
  createMemory: async (data: any) => ({ id: Date.now().toString(), ...data })
};

// Stub llama service
const llamaService = {
  isInitialized: false,
  init: async () => {},
  process: async (text: string) => ({ processed: text }),
  processVoice: async (audio: any) => ({ transcript: 'Voice processing not available in beta' })
};
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string || "demo-user";
    const language = formData.get("language") as string || "en";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["audio/mpeg", "audio/wav", "audio/mp4", "audio/x-m4a", "audio/webm"];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|webm)$/i)) {
      return NextResponse.json(
        { success: false, error: "Invalid audio file type. Please upload MP3, WAV, M4A, or WebM files." },
        { status: 400 }
      );
    }

    // Convert File to Buffer for OpenAI
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save temporary file for processing
    const tempDir = join(process.cwd(), "tmp", "voice");
    const tempFile = join(tempDir, `${Date.now()}-${file.name}`);
    
    // Ensure directory exists
    const { mkdir } = await import("fs/promises");
    await mkdir(tempDir, { recursive: true });
    await writeFile(tempFile, buffer);

    try {
      // Transcribe with Whisper
      const { createReadStream } = await import("fs");
      const transcription = await openai.audio.transcriptions.create({
        file: createReadStream(tempFile),
        model: "whisper-1",
        language: language, // Use selected language
        response_format: "json"
      });

      const transcribedText = transcription.text;

      // Memory store temporarily disabled - SQLite issues in Next.js context
      const memoryContent = `Voice Note Transcription:\n${transcribedText}\n\n[Recorded: ${new Date().toISOString()}]`;
      // const entryId = await memoryStore.addMemory(
      //   userId,
      //   "voice",
      //   0,
      //   memoryContent
      // );
      const entryId = `temp-${Date.now()}`; // Temporary ID

      // Index in LlamaIndex - disabled
      // await llamaService.addMemory(userId, memoryContent);

      // Clean up temp file
      const { unlink } = await import("fs/promises");
      await unlink(tempFile).catch(console.error);

      return NextResponse.json({
        success: true,
        transcription: transcribedText,
        entryId,
        duration: file.size / 16000, // Rough estimate
        timestamp: new Date().toISOString()
      });

    } catch (transcriptionError: any) {
      console.error("Transcription error:", transcriptionError);
      
      // Clean up temp file on error
      const { unlink } = await import("fs/promises");
      await unlink(tempFile).catch(console.error);

      return NextResponse.json(
        { 
          success: false, 
          error: "Failed to transcribe audio",
          details: transcriptionError.message 
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error("Voice upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process voice upload" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "demo-user";
  
  try {
    // Memory store temporarily disabled - SQLite issues in Next.js context
    // const memories = await memoryStore.getMemories(userId, 50);
    // const voiceNotes = memories.filter((m: any) => m.memory_type === "voice");
    const voiceNotes: any[] = []; // Temporary empty array
    
    return NextResponse.json({
      success: true,
      voiceNotes: voiceNotes.map((v: any) => ({
        id: v.id,
        timestamp: v.created_at,
        content: v.content,
        summary: v.content.slice(0, 100) + "..."
      }))
    });
  } catch (error) {
    console.error("Error fetching voice notes:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch voice notes" },
      { status: 500 }
    );
  }
}