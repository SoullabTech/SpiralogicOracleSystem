/**
 * Memory API Routes
 * Exposes the Anamnesis Field to the frontend
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { MemoryManager } from '@/lib/memory/core/MemoryCore';
import { SimpleMemoryStore } from '@/lib/memory/stores/SimpleMemoryStore';
import { SimpleEmbedder } from '@/lib/memory/embeddings/SimpleEmbedder';
import { SimpleCompressor } from '@/lib/memory/compression/SimpleCompressor';

// Initialize memory system
const memoryStore = new SimpleMemoryStore();
const embedder = new SimpleEmbedder();
const compressor = new SimpleCompressor();
const memoryManager = new MemoryManager(memoryStore, embedder, compressor);

/**
 * GET /api/memory
 * Retrieve user memories and statistics
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    switch (action) {
      case 'stats':
        try {
          const stats = await memoryManager.getMemoryStats(userId);
          return NextResponse.json({ stats });
        } catch (error) {
          // Initialize user if not found
          await memoryManager.initializeUser(userId, session.user.name || 'User');
          const stats = await memoryManager.getMemoryStats(userId);
          return NextResponse.json({ stats });
        }

      case 'recall':
        const query = searchParams.get('query') || '';
        const memories = await memoryManager.recall(userId, query, 10);
        return NextResponse.json({ memories });

      case 'timeline':
        const timelineMemories = await memoryStore.searchRecallMemory({
          userId,
          limit: 20
        });
        return NextResponse.json({ memories: timelineMemories });

      case 'insights':
        const insightMemories = await memoryStore.searchRecallMemory({
          userId,
          type: 'insight',
          limit: 5
        });
        return NextResponse.json({ insights: insightMemories });

      default:
        const allMemories = await memoryStore.searchRecallMemory({
          userId,
          limit: 10
        });
        return NextResponse.json({ memories: allMemories });
    }
  } catch (error) {
    console.error('Memory API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve memories' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/memory
 * Store new memories
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { type, content, metadata } = body;

    // Validate input
    if (!type || !content) {
      return NextResponse.json(
        { error: 'Type and content are required' },
        { status: 400 }
      );
    }

    // Store the memory
    await memoryManager.recordMemory(userId, content, type, metadata);
    
    return NextResponse.json({
      success: true,
      message: 'Memory stored successfully'
    });

  } catch (error) {
    console.error('Memory storage error:', error);
    return NextResponse.json(
      { error: 'Failed to store memory' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/memory
 * Update memory metadata or importance
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { memoryId, importance, metadata } = body;

    if (!memoryId) {
      return NextResponse.json(
        { error: 'Memory ID is required' },
        { status: 400 }
      );
    }

    // Update memory importance
    await memoryStore.updateRecallImportance(memoryId, importance);
    
    return NextResponse.json({ 
      success: true,
      message: 'Memory updated successfully'
    });

  } catch (error) {
    console.error('Memory update error:', error);
    return NextResponse.json(
      { error: 'Failed to update memory' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/memory
 * Archive old memories (soft delete)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const beforeDate = searchParams.get('before');

    if (!beforeDate) {
      return NextResponse.json(
        { error: 'Before date is required for archival' },
        { status: 400 }
      );
    }

    // Archive old memories
    const beforeDateObj = new Date(beforeDate);
    await memoryStore.archiveMemories(userId, new Date(0), beforeDateObj);
    
    return NextResponse.json({ 
      success: true,
      message: 'Memories archived successfully'
    });

  } catch (error) {
    console.error('Memory archival error:', error);
    return NextResponse.json(
      { error: 'Failed to archive memories' },
      { status: 500 }
    );
  }
}