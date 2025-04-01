import { createClient } from '@supabase/supabase-js';
import type { Memory } from '../../types';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { clientId, element, archetype } = await req.json();

    if (!clientId || !element || !archetype) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400 }
      );
    }

    // Create initial memory blocks
    const blocks = [
      {
        user_id: clientId,
        label: 'profile',
        value: JSON.stringify({
          element,
          archetype,
          created_at: new Date().toISOString()
        }),
        importance: 10,
        type: 'profile'
      },
      {
        user_id: clientId,
        label: 'element_affinity',
        value: `Primary elemental affinity: ${element}`,
        importance: 8,
        type: 'insight'
      },
      {
        user_id: clientId,
        label: 'archetype_insight',
        value: `Core archetype expression: ${archetype}`,
        importance: 8,
        type: 'insight'
      }
    ];

    // Store memory blocks
    const { error: blockError } = await supabase
      .from('memory_blocks')
      .insert(blocks);

    if (blockError) {
      throw blockError;
    }

    // Create initial memories for connection analysis
    const memories: Partial<Memory>[] = [
      {
        user_id: clientId,
        content: `Client profile initialized with ${element} element and ${archetype} archetype.`,
        type: 'profile',
        metadata: {
          element,
          archetype,
          source: 'initialization'
        },
        strength: 1.0
      },
      {
        user_id: clientId,
        content: `Primary elemental alignment: ${element}`,
        type: 'insight',
        metadata: {
          element,
          source: 'initialization',
          importance: 'high'
        },
        strength: 0.9
      },
      {
        user_id: clientId,
        content: `Core archetypal expression: ${archetype}`,
        type: 'insight',
        metadata: {
          archetype,
          source: 'initialization',
          importance: 'high'
        },
        strength: 0.9
      }
    ];

    // Store memories
    const { error: memoryError } = await supabase
      .from('memories')
      .insert(memories);

    if (memoryError) {
      throw memoryError;
    }

    return Response.json({
      status: 'success',
      message: 'Memory blocks and connections seeded successfully'
    });
  } catch (error) {
    console.error('Failed to seed memory:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to seed memory' }),
      { status: 500 }
    );
  }
}