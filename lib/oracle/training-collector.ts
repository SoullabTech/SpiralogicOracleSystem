import { randomUUID } from 'crypto';

export async function collectTrainingMetrics(
  userId: string,
  conversationId: string,
  input: string,
  finalResponse: string,
  contextPack: any,
  sacredSynthesis: any
): Promise<void> {
  if (process.env.COLLECT_TRAINING_DATA !== 'true') {
    return;
  }

  try {
    const trainingData = {
      id: randomUUID(),
      userId,
      conversationId,
      timestamp: new Date().toISOString(),
      input: {
        text: input,
        wordCount: input.split(/\s+/).length,
        characterCount: input.length
      },
      output: {
        text: finalResponse,
        wordCount: finalResponse.split(/\s+/).length,
        characterCount: finalResponse.length
      },
      context: {
        hasMicroPsi: !!contextPack?.micropsi,
        hasUploads: !!contextPack?.uploads?.items?.length,
        facetHintsCount: contextPack?.facetHints ? Object.keys(contextPack.facetHints).length : 0,
        ainSnippetsCount: contextPack?.ainSnippets?.length || 0,
        soulSnippetsCount: contextPack?.soulSnippets?.length || 0
      },
      synthesis: {
        hasSacred: !!sacredSynthesis,
        quality: sacredSynthesis?.quality || null
      }
    };

    // Store training data (implementation depends on your training infrastructure)
    console.log('[training] Collected metrics:', JSON.stringify(trainingData, null, 2));
    
    // TODO: Send to training data collection service
    // await sendToTrainingService(trainingData);
    
  } catch (error) {
    console.warn('Training metrics collection failed:', error);
  }
}