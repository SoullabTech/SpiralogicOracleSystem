import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { soulMemoryId, bookmark } = await request.json();
    
    if (!soulMemoryId) {
      return NextResponse.json(
        { error: 'Soul Memory ID is required' },
        { status: 400 }
      );
    }

    // Use soul memory client for consistent API access
    const { SoulMemoryClient } = await import('@/lib/shared/memory/soulMemoryClient');
    
    // Store bookmark using the client interface
    const result = await SoulMemoryClient.storeBookmark({
      userId: 'system', // This should come from auth context
      content: `Bookmark for memory ${soulMemoryId}`,
      context: { bookmark, originalMemoryId: soulMemoryId }
    });
    
    const updated = !!result.id;
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to store bookmark' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      soulMemoryId,
      bookmarked: bookmark,
    });

  } catch (error) {
    console.error('Bookmark API error:', error);
    return NextResponse.json(
      { error: 'Failed to update bookmark' },
      { status: 500 }
    );
  }
}