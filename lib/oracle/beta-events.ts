export async function emitOracleTurnEvents(
  authenticatedUser: any,
  conversationId: string,
  finalResponse: string,
  sacredSynthesis: any,
  contextPack: any,
  dualMemoryResult: any
): Promise<void> {
  try {
    const { emitBetaEventServer } = await import('@/lib/beta/emit');
    const { betaEvents } = await import('@/lib/beta/events');

    const events = [
      betaEvents.oracleTurnCompleted({
        userId: authenticatedUser?.id || 'anonymous',
        conversationId,
        response: finalResponse,
        timestamp: new Date().toISOString()
      })
    ];

    if (sacredSynthesis) {
      events.push(betaEvents.sacredSynthesisCompleted({
        userId: authenticatedUser?.id || 'anonymous',
        conversationId,
        synthesis: sacredSynthesis,
        timestamp: new Date().toISOString()
      }));
    }

    if (contextPack?.micropsi) {
      events.push(betaEvents.micropsiAnalysisCompleted({
        userId: authenticatedUser?.id || 'anonymous',
        conversationId,
        analysis: contextPack.micropsi,
        timestamp: new Date().toISOString()
      }));
    }

    await Promise.all(events.map(event => emitBetaEventServer(event)));
  } catch (error) {
    console.warn('Beta event emission failed:', error);
  }
}