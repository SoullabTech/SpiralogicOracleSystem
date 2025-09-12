/**
 * Integration patch for adding StorytellerAgent to PersonalOracleAgent
 * This file shows how to integrate storytelling capabilities into the main oracle system
 */

// Add to imports section:
import { StorytellerAgent, StorytellerContext, StoryResponse } from './StorytellerAgent';

// Add to class properties:
private storytellerAgent: StorytellerAgent;

// Add to constructor:
this.storytellerAgent = new StorytellerAgent();
logger.info("Personal Oracle Agent initialized with StorytellerAgent");

// Add new method for story detection and generation:
/**
 * Detect if user is requesting a story
 */
private detectStoryRequest(input: string): boolean {
  const storyKeywords = [
    'tell me a story',
    'share a story',
    'give me a parable',
    'tell me a tale',
    'share a myth',
    'tell me a fable',
    'share wisdom through story',
    'story about',
    'parable about',
    'myth about',
    'tale of',
    'story for',
    'narrative',
    'allegory',
    'poem'
  ];
  
  const lower = input.toLowerCase();
  return storyKeywords.some(keyword => lower.includes(keyword));
}

/**
 * Extract story context from user query
 */
private extractStoryContext(input: string): {
  challenge?: string;
  desiredOutcome?: string;
} {
  const context: { challenge?: string; desiredOutcome?: string } = {};
  
  // Extract challenge patterns
  const challengePatterns = [
    /struggling with (.*?)(?:\.|,|$)/i,
    /facing (.*?)(?:\.|,|$)/i,
    /dealing with (.*?)(?:\.|,|$)/i,
    /challenge (?:is|of) (.*?)(?:\.|,|$)/i,
    /problem (?:is|with) (.*?)(?:\.|,|$)/i
  ];
  
  for (const pattern of challengePatterns) {
    const match = input.match(pattern);
    if (match) {
      context.challenge = match[1].trim();
      break;
    }
  }
  
  // Extract desired outcome patterns
  const outcomePatterns = [
    /want to (.*?)(?:\.|,|$)/i,
    /hoping to (.*?)(?:\.|,|$)/i,
    /need to (.*?)(?:\.|,|$)/i,
    /trying to (.*?)(?:\.|,|$)/i,
    /seeking (.*?)(?:\.|,|$)/i,
    /looking for (.*?)(?:\.|,|$)/i
  ];
  
  for (const pattern of outcomePatterns) {
    const match = input.match(pattern);
    if (match) {
      context.desiredOutcome = match[1].trim();
      break;
    }
  }
  
  return context;
}

// Modify the main processQuery method to include story handling:
// Add this check after elemental detection but before generating response:

// Check if user is requesting a story
if (this.detectStoryRequest(query.input)) {
  return await this.generateStoryResponse(query, optimalElement, memories, settings);
}

// Add new method for generating story responses:
/**
 * Generate a story response using the StorytellerAgent
 */
private async generateStoryResponse(
  query: PersonalOracleQuery,
  element: string,
  memories: any[],
  settings: PersonalOracleSettings
): Promise<PersonalOracleResponse> {
  
  try {
    // Extract story context from query
    const storyContextExtract = this.extractStoryContext(query.input);
    
    // Build storyteller context
    const storytellerContext: StorytellerContext = {
      userQuery: query.input,
      emotionalState: {
        // Analyze emotional state from query and memories
        emotionalBalance: {
          joy: 0.5, sadness: 0.3, fear: 0.2, anger: 0.1,
          surprise: 0.4, disgust: 0.1, trust: 0.6, anticipation: 0.5,
          love: 0.7, contempt: 0.1, pride: 0.4, shame: 0.2,
          curiosity: 0.7, awe: 0.6, confusion: 0.3, excitement: 0.5,
          gratitude: 0.6, hope: 0.7, boredom: 0.2, frustration: 0.3,
          contemplation: 0.6, confidence: 0.5
        },
        motivationalDrives: {
          growth: 0.7, safety: 0.5, connection: 0.6, achievement: 0.5,
          understanding: 0.7, expression: 0.6, transcendence: 0.6, contribution: 0.5
        },
        elementalResonance: {
          fire: element === 'fire' ? 0.8 : 0.3,
          water: element === 'water' ? 0.8 : 0.3,
          earth: element === 'earth' ? 0.8 : 0.3,
          air: element === 'air' ? 0.8 : 0.3,
          aether: element === 'aether' ? 0.8 : 0.3
        },
        resonanceScore: 0.7
      },
      elementalAffinity: element,
      currentChallenge: storyContextExtract.challenge,
      desiredOutcome: storyContextExtract.desiredOutcome,
      previousStories: [] // TODO: Retrieve from memory service
    };
    
    // Create consciousness profile
    const consciousnessProfile = {
      awarenessLevel: 0.7,
      integrationDepth: 0.6,
      resonanceField: {
        fire: element === 'fire' ? 0.8 : 0.3,
        water: element === 'water' ? 0.8 : 0.3,
        earth: element === 'earth' ? 0.8 : 0.3,
        air: element === 'air' ? 0.8 : 0.3,
        aether: element === 'aether' ? 0.8 : 0.3
      },
      transformationReadiness: 0.7,
      shadowIntegration: 0.5,
      archetypeActivation: {
        Seeker: 0.8,
        Sage: 0.6,
        Hero: 0.5,
        Healer: 0.5,
        Creator: 0.6
      }
    };
    
    // Generate story using StorytellerAgent
    const storyResponse: StoryResponse = await this.storytellerAgent.weaveStory(
      storytellerContext,
      consciousnessProfile
    );
    
    // Format the complete response with Maya's voice
    const formattedResponse = this.formatStoryResponse(storyResponse, element);
    
    // Store the story in memory
    await storeMemoryItem({
      userId: query.userId,
      content: `Story: ${storyResponse.story.title || 'Untitled'} - ${storyResponse.story.structure.type}`,
      type: 'story',
      metadata: {
        element,
        storyType: storyResponse.story.structure.type,
        emotionalResonance: storyResponse.metadata.emotionalResonance,
        archetypes: storyResponse.interpretation.archetypeActivation
      }
    });
    
    return {
      message: formattedResponse,
      element,
      archetype: storyResponse.interpretation.archetypeActivation[0] || 'Storyteller',
      confidence: 0.9,
      voiceCharacteristics: {
        tone: this.getElementalTone(element),
        masteryVoiceApplied: true,
        elementalVoicing: true
      },
      metadata: {
        sessionId: query.sessionId,
        symbols: storyResponse.metadata.mythologicalReferences,
        phase: `${storyResponse.story.structure.type}-narrative`,
        recommendations: storyResponse.integration.reflectionPrompts,
        nextSteps: [
          storyResponse.integration.journalQuestion,
          storyResponse.integration.practicalApplication
        ]
      }
    };
    
  } catch (error) {
    logger.error("Story generation failed", { error, userId: query.userId });
    
    // Fallback to a simple story-style response
    return {
      message: "Let me share ancient wisdom with you... Once, in the timeless space of the soul, a seeker much like yourself stood at the crossroads of becoming. The path ahead shimmered with possibility, and though the way was uncertain, their heart knew the truth: every journey begins with a single step taken in faith. What step is your soul calling you to take today?",
      element,
      archetype: 'Storyteller',
      confidence: 0.7,
      metadata: {
        sessionId: query.sessionId,
        symbols: ['journey', 'crossroads', 'faith'],
        phase: 'wisdom-narrative',
        recommendations: ["Reflect on the story's message", "Journal about your own journey"],
        nextSteps: ["Take one small step toward your calling today"]
      }
    };
  }
}

/**
 * Format story response with Maya's voice
 */
private formatStoryResponse(storyResponse: StoryResponse, element: string): string {
  const { story, interpretation, integration } = storyResponse;
  
  let response = '';
  
  // Add Maya's introduction
  const introductions = {
    fire: "🔥 Let me ignite your imagination with a tale of transformation...",
    water: "💧 Allow this story to flow through your consciousness like healing waters...",
    earth: "🌱 I offer you this story, rooted in ancient wisdom and practical truth...",
    air: "🌬️ Let this narrative carry you on wings of insight and clarity...",
    aether: "✨ From the realm of eternal stories, I bring you this sacred teaching..."
  };
  
  response += introductions[element] || introductions.aether;
  response += '\n\n';
  
  // Add the story title if present
  if (story.title) {
    response += `**${story.title}**\n\n`;
  }
  
  // Add the story content
  response += story.content;
  response += '\n\n---\n\n';
  
  // Add Maya's interpretation
  response += '**The Mirror of Meaning:**\n';
  response += interpretation.personalMeaning;
  response += '\n\n';
  
  // Add wisdom teaching
  response += '**The Sacred Teaching:**\n';
  response += interpretation.wisdomTeaching;
  response += '\n\n';
  
  // Add integration guidance
  response += '**Your Path Forward:**\n';
  response += integration.practicalApplication;
  response += '\n\n';
  
  // Add reflection prompt
  response += '*Reflection for your journey:* ';
  response += integration.journalQuestion;
  
  return response;
}

/**
 * Get elemental tone for voice characteristics
 */
private getElementalTone(element: string): 'energetic' | 'flowing' | 'grounded' | 'clear' | 'contemplative' {
  const tones = {
    fire: 'energetic' as const,
    water: 'flowing' as const,
    earth: 'grounded' as const,
    air: 'clear' as const,
    aether: 'contemplative' as const
  };
  
  return tones[element] || 'contemplative';
}

// Add to the analytics tracking (in existing processQuery method):
// After successful story generation:
logger.info("Story generated for user", {
  userId: query.userId,
  element,
  storyType: storyResponse.story.structure.type,
  narrativeStyle: storyResponse.story.style.voice,
  emotionalResonance: storyResponse.metadata.emotionalResonance,
  archetypesActivated: storyResponse.interpretation.archetypeActivation
});