import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "tmp");
const JOURNAL_FILE = join(DATA_DIR, "journal.json");

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  timestamp: string;
  mood?: string;
  tags?: string[];
}

function readJournalData(): JournalEntry[] {
  if (!existsSync(JOURNAL_FILE)) {
    return [];
  }
  try {
    const data = readFileSync(JOURNAL_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading journal data:", error);
    return [];
  }
}

function writeJournalData(entries: JournalEntry[]): void {
  try {
    writeFileSync(JOURNAL_FILE, JSON.stringify(entries, null, 2));
  } catch (error) {
    console.error("Error writing journal data:", error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "demo-user";

    const allEntries = readJournalData();
    const userEntries = allEntries.filter(entry => entry.userId === userId);

    return NextResponse.json({ 
      success: true,
      entries: userEntries.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    });

  } catch (error) {
    console.error("Error getting journal entries:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get journal entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId = "demo-user", title, content, text, mood, tags } = body;

    // Handle both 'text' (legacy) and 'title'+'content' formats
    const entryTitle = title || "Reflection";
    const entryContent = content || text || "";

    if (!entryContent.trim()) {
      return NextResponse.json(
        { success: false, error: "Content is required" },
        { status: 400 }
      );
    }

    const newEntry: JournalEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId,
      title: entryTitle,
      content: entryContent,
      timestamp: new Date().toISOString(),
      mood,
      tags
    };

    const allEntries = readJournalData();
    allEntries.push(newEntry);
    writeJournalData(allEntries);

    // In production, this would save to memory store and index in LlamaIndex
    // For now, we're using local JSON storage
    const entryId = newEntry.id;

    return NextResponse.json({ 
      success: true,
      entry: newEntry,
      message: "Journal entry saved successfully",
      entryId
    });

  } catch (error) {
    console.error("Error saving journal entry:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save journal entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get("id");
    const userId = searchParams.get("userId") || "demo-user";

    if (!entryId) {
      return NextResponse.json(
        { success: false, error: "Entry ID is required" },
        { status: 400 }
      );
    }

    const allEntries = readJournalData();
    const updatedEntries = allEntries.filter(
      entry => !(entry.id === entryId && entry.userId === userId)
    );

    writeJournalData(updatedEntries);

    return NextResponse.json({ 
      success: true,
      message: "Journal entry deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting journal entry:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete journal entry" },
      { status: 500 }
    );
  }
}