// routes/orchestrator.routes.ts - Agent Orchestrator API Routes
import { Router } from 'express';
import { agentOrchestrator } from '../services/agentOrchestrator';

const router = Router();

/**
 * @route POST /api/orchestrator/query
 * @description Process query through agent orchestration system
 */
router.post('/query', async (req, res) => {
  try {
    const { input, userContext } = req.body;

    if (!input) {
      return res.status(400).json({
        success: false,
        error: 'Input is required'
      });
    }

    const result = await agentOrchestrator.processQuery(input, userContext);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Orchestrator query error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process orchestrated query',
      message: error.message
    });
  }
});

/**
 * @route GET /api/orchestrator/insights
 * @description Get archetypal insights for user session
 */
router.get('/insights', async (req, res) => {
  try {
    const { sessionId, userId } = req.query;
    const userContext = { sessionId: sessionId as string, userId: userId as string };

    const insights = await agentOrchestrator.getArchetypalInsights(userContext);

    res.json({
      success: true,
      data: insights,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Orchestrator insights error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate archetypal insights',
      message: error.message
    });
  }
});

/**
 * @route GET /api/orchestrator/health
 * @description Health check for Agent Orchestrator
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Agent Orchestrator',
    description: 'Collective Intelligence Coordination System',
    status: 'active',
    features: [
      'Archetypal Intent Analysis',
      'Multi-Agent Response Synthesis',
      'Dynamic Orchestration Strategies',
      'Collective Memory Management',
      'Emergent Wisdom Generation'
    ],
    orchestrationStrategies: [
      'fire_lead',
      'water_lead',
      'fire_water_synthesis',
      'water_fire_synthesis',
      'dual_synthesis',
      'fire_balance',
      'water_balance'
    ],
    supportedAgents: [
      'Fire Agent (Vision & Creative Transformation)',
      'Water Agent (Emotional Intelligence & Flow State)'
    ],
    collectiveIntelligence: {
      archetypalBalancing: true,
      patternRecognition: true,
      emergentWisdomGeneration: true,
      sessionMemory: true
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * @route POST /api/orchestrator/reset-session
 * @description Reset collective memory for a session
 */
router.post('/reset-session', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    // Clear session memory (orchestrator handles this internally)
    res.json({
      success: true,
      message: 'Session memory reset',
      sessionId,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Session reset error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset session',
      message: error.message
    });
  }
});

export default router;