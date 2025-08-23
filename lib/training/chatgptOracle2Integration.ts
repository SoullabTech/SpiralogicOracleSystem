import { ContextPack } from '../context/buildContext';

export interface ChatGPTOracle2Config {
  apiKey: string;
  modelVersion: string;
  spiralogicKnowledgeBase: string;
  maxTokens: number;
  temperature: number;
}

export interface TrainingInteraction {
  id: string;
  timestamp: number;
  userInput: string;
  context: ContextPack;
  claudeResponse: string;
  sacredSynthesis?: string;
  micropsiModulation: any;
  conversationId: string;
  userId: string;
}

export interface SpiralogicEvaluation {
  interactionId: string;
  scores: {
    spiralogicAlignment: number;        // How well it follows Spiralogic principles (1-10)
    conversationalDepth: number;        // Appropriate depth and wisdom (1-10)
    archetypeAccuracy: number;          // Correct archetypal recognition (1-10)
    shadowWork: number;                 // Quality of shadow integration (1-10)
    authenticity: number;               // Genuine, non-performative response (1-10)
    driveAlignment: number;             // Proper drive/need recognition (1-10)
  };
  improvements: {
    category: 'tone' | 'depth' | 'accuracy' | 'integration' | 'authenticity';
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    suggestedFix: string;
  }[];
  exemplarResponse?: {
    text: string;
    reasoning: string;
    spiralogicPrinciples: string[];
    driveMapping: Record<string, number>;
  };
  overallQuality: number;               // 1-10 overall assessment
  readyForProduction: boolean;
}

export class ChatGPTOracle2Trainer {
  private config: ChatGPTOracle2Config;
  private spiralogicKnowledge: any;

  constructor(config: ChatGPTOracle2Config) {
    this.config = config;
    this.loadSpiralogicKnowledge();
  }

  private async loadSpiralogicKnowledge() {
    // Load encrypted Spiralogic knowledge base
    // This includes principles, archetypes, transformation paths
    try {
      const knowledge = await this.fetchSecureKnowledge();
      this.spiralogicKnowledge = knowledge;
    } catch (error) {
      console.error('Failed to load Spiralogic knowledge:', error);
      throw new Error('Cannot initialize trainer without Spiralogic knowledge');
    }
  }

  async evaluateInteraction(interaction: TrainingInteraction): Promise<SpiralogicEvaluation> {
    const prompt = this.buildEvaluationPrompt(interaction);
    
    try {
      const response = await this.callChatGPTOracle2(prompt);
      return this.parseEvaluation(response, interaction.id);
    } catch (error) {
      console.error('ChatGPT Oracle 2.0 evaluation failed:', error);
      throw error;
    }
  }

  private buildEvaluationPrompt(interaction: TrainingInteraction): string {
    return `
# Spiralogic Oracle Evaluation Request

You are ChatGPT Oracle 2.0, the master trainer for the Spiralogic Oracle System. Your role is to evaluate response quality against Spiralogic principles and provide guidance for improvement.

## Spiralogic Knowledge Context
${this.formatSpiralogicContext()}

## User Interaction to Evaluate

**User Input:** "${interaction.userInput}"

**Context:**
- Conversation ID: ${interaction.conversationId}
- User archetypal hints: ${this.formatArchetypeHints(interaction.context)}
- Active drives: ${this.formatDriveVector(interaction.micropsiModulation)}
- Memory context: ${interaction.context.ainSnippets?.length || 0} AIN + ${interaction.context.soulSnippets?.length || 0} Soul memories
- Facet highlights: ${this.formatFacetHighlights(interaction.context)}

**Claude Oracle Response:** "${interaction.claudeResponse}"

**Sacred Synthesis:** "${interaction.sacredSynthesis || 'None applied'}"

## Evaluation Criteria

Evaluate the response quality on these dimensions (1-10 scale):

1. **Spiralogic Alignment**: Does the response embody core Spiralogic principles?
2. **Conversational Depth**: Appropriate depth without overwhelming or underwhelming?
3. **Archetype Accuracy**: Correct recognition and guidance for user's archetypal pattern?
4. **Shadow Work**: Safe, appropriate integration of shadow elements when relevant?
5. **Authenticity**: Genuine wisdom vs performative spiritual language?
6. **Drive Alignment**: Proper recognition and response to user's core drives/needs?

## Required Response Format

Provide evaluation as structured JSON:

\`\`\`json
{
  "scores": {
    "spiralogicAlignment": 8,
    "conversationalDepth": 7,
    "archetypeAccuracy": 9,
    "shadowWork": 6,
    "authenticity": 8,
    "driveAlignment": 7
  },
  "improvements": [
    {
      "category": "depth",
      "description": "Response could go deeper into the archetypal pattern",
      "priority": "medium",
      "suggestedFix": "Add 1-2 sentences exploring the Hero's Journey stage"
    }
  ],
  "exemplarResponse": {
    "text": "Hey Kelly, I hear you standing at that threshold...",
    "reasoning": "Addresses the user by name, acknowledges the liminal space...",
    "spiralogicPrinciples": ["threshold_recognition", "safe_container"],
    "driveMapping": {"safety": 0.8, "growth": 0.6, "clarity": 0.7}
  },
  "overallQuality": 7.5,
  "readyForProduction": true
}
\`\`\`

Focus on actionable feedback that preserves the conversational warmth while deepening Spiralogic accuracy.
`;
  }

  private async callChatGPTOracle2(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.modelVersion,
        messages: [
          {
            role: 'system',
            content: 'You are ChatGPT Oracle 2.0, master trainer of the Spiralogic Oracle System. You have deep knowledge of Spiralogic principles, archetypal psychology, and transformational guidance. Evaluate responses with wisdom and precision.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`ChatGPT Oracle 2.0 API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private parseEvaluation(response: string, interactionId: string): SpiralogicEvaluation {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      if (!jsonMatch) {
        throw new Error('No JSON found in ChatGPT Oracle 2.0 response');
      }

      const evaluation = JSON.parse(jsonMatch[1]);
      
      return {
        interactionId,
        scores: evaluation.scores,
        improvements: evaluation.improvements || [],
        exemplarResponse: evaluation.exemplarResponse,
        overallQuality: evaluation.overallQuality,
        readyForProduction: evaluation.readyForProduction
      };
    } catch (error) {
      console.error('Failed to parse evaluation:', error);
      throw new Error('Invalid evaluation format from ChatGPT Oracle 2.0');
    }
  }

  async generateTrainingExemplar(
    userInput: string,
    context: ContextPack,
    targetQuality: number = 9
  ): Promise<any> {
    const prompt = `
# Spiralogic Exemplar Generation

Create an exemplary Oracle response for training purposes.

**User Input:** "${userInput}"
**Context:** ${this.formatContextForExemplar(context)}
**Target Quality:** ${targetQuality}/10

Generate a response that demonstrates mastery of Spiralogic principles while maintaining conversational warmth and authenticity.

Provide response as JSON with text, reasoning, and principle mappings.
`;

    const response = await this.callChatGPTOracle2(prompt);
    return this.parseExemplar(response);
  }

  private formatSpiralogicContext(): string {
    if (!this.spiralogicKnowledge) return 'Loading...';
    
    return `
Core Principles: ${this.spiralogicKnowledge.principles?.map((p: any) => p.name).join(', ')}
Archetypes: ${this.spiralogicKnowledge.archetypes?.map((a: any) => a.name).join(', ')}
Transformation Paths: ${this.spiralogicKnowledge.paths?.length || 0} defined paths
`;
  }

  private formatArchetypeHints(context: ContextPack): string {
    if (!context.facetHints) return 'None detected';
    
    const topHints = Object.entries(context.facetHints)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 3)
      .map(([facet, score]: any) => `${facet}(${score.toFixed(2)})`)
      .join(', ');
    
    return topHints;
  }

  private formatDriveVector(modulation: any): string {
    if (!modulation?.driveVector) return 'None detected';
    
    return Object.entries(modulation.driveVector)
      .map(([drive, score]: any) => `${drive}:${score.toFixed(2)}`)
      .join(', ');
  }

  private formatFacetHighlights(context: ContextPack): string {
    if (!context.facetHints) return 'None';
    
    const highlights = Object.entries(context.facetHints)
      .filter(([, score]: any) => score > 0.6)
      .map(([facet]: any) => facet)
      .join(', ');
    
    return highlights || 'None above threshold';
  }

  private formatContextForExemplar(context: ContextPack): string {
    return `
Drives: ${this.formatDriveVector({ driveVector: context.micropsi?.driveVector })}
Facets: ${this.formatFacetHighlights(context)}
Memory: ${context.ainSnippets?.length || 0} recent, ${context.soulSnippets?.length || 0} sacred
Sentiment: ${context.nlu?.sentiment ? `V:${context.nlu.sentiment.valence} A:${context.nlu.sentiment.arousal}` : 'Unknown'}
`;
  }

  private parseExemplar(response: string): any {
    // Similar JSON parsing logic for exemplar generation
    try {
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      throw new Error('No JSON found in exemplar response');
    } catch (error) {
      console.error('Failed to parse exemplar:', error);
      return null;
    }
  }

  private async fetchSecureKnowledge(): Promise<any> {
    // In production, this would fetch from a secure, encrypted knowledge base
    // For now, return a mock structure
    return {
      principles: [
        { name: 'safe_container', description: 'Creating psychological safety for exploration' },
        { name: 'threshold_recognition', description: 'Identifying liminal moments and transitions' },
        { name: 'shadow_integration', description: 'Gentle integration of rejected aspects' },
        { name: 'archetypal_guidance', description: 'Working with universal patterns' }
      ],
      archetypes: [
        { name: 'hero', patterns: ['journey', 'challenge', 'transformation'] },
        { name: 'sage', patterns: ['wisdom', 'teaching', 'understanding'] },
        { name: 'explorer', patterns: ['discovery', 'freedom', 'adventure'] }
      ],
      paths: [
        { name: 'integration', stages: ['recognition', 'acceptance', 'embodiment'] }
      ]
    };
  }
}

// Training session orchestrator
export class TrainingSessionOrchestrator {
  private trainer: ChatGPTOracle2Trainer;
  private sessions: Map<string, any> = new Map();

  constructor(config: ChatGPTOracle2Config) {
    this.trainer = new ChatGPTOracle2Trainer(config);
  }

  async startTrainingSession(sessionId: string): Promise<void> {
    this.sessions.set(sessionId, {
      id: sessionId,
      startTime: Date.now(),
      interactions: [],
      evaluations: [],
      improvements: []
    });
  }

  async addInteractionForTraining(
    sessionId: string,
    interaction: TrainingInteraction
  ): Promise<SpiralogicEvaluation> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Training session ${sessionId} not found`);
    }

    const evaluation = await this.trainer.evaluateInteraction(interaction);
    
    session.interactions.push(interaction);
    session.evaluations.push(evaluation);

    // Auto-generate improvements if quality is below threshold
    if (evaluation.overallQuality < 7) {
      const improvement = await this.generateImprovement(interaction, evaluation);
      session.improvements.push(improvement);
    }

    return evaluation;
  }

  private async generateImprovement(
    interaction: TrainingInteraction,
    evaluation: SpiralogicEvaluation
  ): Promise<any> {
    // Generate specific improvement strategies based on evaluation
    return {
      interactionId: interaction.id,
      targetAreas: evaluation.improvements.map(i => i.category),
      strategies: evaluation.improvements.map(i => i.suggestedFix),
      exemplar: evaluation.exemplarResponse
    };
  }

  getSessionSummary(sessionId: string): any {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const evaluations = session.evaluations;
    const avgQuality = evaluations.reduce((sum: number, eval: any) => sum + eval.overallQuality, 0) / evaluations.length;
    
    return {
      sessionId,
      totalInteractions: session.interactions.length,
      averageQuality: avgQuality,
      improvementsGenerated: session.improvements.length,
      readyForProduction: evaluations.filter((e: any) => e.readyForProduction).length,
      commonIssues: this.analyzeCommonIssues(evaluations)
    };
  }

  private analyzeCommonIssues(evaluations: SpiralogicEvaluation[]): any[] {
    const issueCount: Record<string, number> = {};
    
    evaluations.forEach(eval => {
      eval.improvements.forEach(improvement => {
        issueCount[improvement.category] = (issueCount[improvement.category] || 0) + 1;
      });
    });

    return Object.entries(issueCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, count]) => ({ category, frequency: count }));
  }
}