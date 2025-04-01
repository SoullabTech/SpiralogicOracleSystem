import { createClient } from '@supabase/supabase-js';
import { ClaudeClient } from '../../lib/claude-client';
import { OpenAIClient } from '../../lib/openai-client';
import { MemoryBlockManager } from '../../lib/memory-blocks';
import type { Message } from '../../types';

// Initialize clients
const claude = new ClaudeClient(process.env.VITE_CLAUDE_API_KEY!);
const openai = new OpenAIClient(process.env.VITE_OPENAI_API_KEY!);
const memoryManager = new MemoryBlockManager();
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { provider, message, clientId, clientName, context } = await req.json();

    if (!message || !clientId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400 }
      );
    }

    // Get existing memory blocks for context
    const memoryBlocks = await memoryManager.getMemoryBlocks(clientId, {
      limit: 5,
      minImportance: 5
    });

    // Add memory context to the request
    const enrichedContext = {
      ...context,
      memory_blocks: memoryBlocks,
      client_id: clientId,
      client_name: clientName
    };

    // Get response from selected provider
    const response: Message = provider === 'claude'
      ? await claude.chat(message, enrichedContext)
      : await openai.chat(message, enrichedContext);

    // Store response in memory blocks
    await memoryManager.createMemoryBlock({
      user_id: clientId,
      label: 'oracle_response',
      value: response.content,
      importance: 7,
      type: 'insight'
    });

    // Store in memories table for connection analysis
    const { error: memoryError } = await supabase
      .from('memories')
      .insert({
        user_id: clientId,
        content: response.content,
        type: 'oracle_response',
        metadata: {
          provider,
          element: response.element,
          insight_type: response.insight_type
        },
        strength: 0.8
      });

    if (memoryError) {
      console.error('Error storing memory:', memoryError);
    }

    return Response.json({
      result: response.content,
      analysis: {
        element: response.element,
        insightType: response.insight_type
      }
    });
  } catch (error) {
    console.error('Oracle API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }),
      { status: 500 }
    );
  }
}