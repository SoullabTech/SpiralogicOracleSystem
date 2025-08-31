// Quick test of the conversational pipeline
const express = require('express');
const app = express();

app.use(express.json());

// Test health endpoint
app.get('/api/v1/converse/health', (req, res) => {
  res.json({
    success: true,
    service: 'Sesame/Maya Conversational Pipeline',
    status: 'healthy',
    architecture: {
      draftGeneration: 'Air → Claude | Others → Elemental Oracle 2.0',
      finalShaping: 'Sesame Conversational Intelligence',
      voiceSynthesis: 'Maya TTS',
      safetyLayer: 'OpenAI Moderation + Crisis Detection'
    },
    features: [
      'Elemental Intelligence Routing',
      'Anti-Canned Response Guard',
      'Sesame CI Shaping',
      'Maya Voice Synthesis',
      'Cost Control & Debouncing',
      'Crisis-Safe Processing'
    ],
    configuration: {
      airModel: 'claude-3-sonnet',
      elementalOracle: 'gpt-4o-mini',
      sesameTTS: 'maya-voice',
      costControls: {
        maxTextLength: '1000 chars',
        debounceMs: 500,
        cacheMinutes: 5
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Test conversational endpoint
app.post('/api/v1/converse', (req, res) => {
  const { userText, userId, element = 'aether', voiceEnabled = false } = req.body;
  
  if (!userText || !userId) {
    return res.status(400).json({
      success: false,
      error: 'userText and userId are required'
    });
  }

  // Mock response showing the architecture in action
  res.json({
    success: true,
    response: {
      text: `I hear your question about "${userText.slice(0, 50)}..." The ${element} element guides me to respond with clarity and wisdom. This demonstrates our Sesame/Maya pipeline working - upstream models draft, Sesame CI shapes, Maya TTS would voice this if enabled.`,
      audioUrl: voiceEnabled ? 'https://example.com/maya-audio.wav' : null,
      element: element,
      source: 'sesame_shaped',
      processingTime: 1250,
      metadata: {
        draftModel: element === 'air' ? 'claude-3-sonnet' : 'gpt-4o-elemental',
        reshapeCount: 0,
        voiceSynthesized: voiceEnabled,
        cost: {
          draftTokens: 89,
          ttsSeconds: voiceEnabled ? 3.2 : undefined
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`🔮 Conversational Pipeline Test Server running on port ${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/v1/converse/health`);
  console.log(`💬 Converse: POST http://localhost:${PORT}/api/v1/converse`);
});