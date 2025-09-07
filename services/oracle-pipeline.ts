// Oracle Pipeline - TypeScript Implementation with Temporal Buffer

import { Anthropic } from '@anthropic-ai/sdk';

interface StageDefinition {
  name: string;
  prompt: string | ((context: string) => string);
}

interface StageResult {
  stage: string;
  output: string;
  timestamp: number;
}

interface PipelineResult {
  final: string;
  stages?: StageResult[];
  elements?: Record<string, string>;
  sessionId?: string;
}

interface TemporalBufferEntry {
  sessionId: string;
  userId?: string;
  input: string;
  stages: StageResult[];
  timestamp: number;
  elements: Record<string, string>;
}

export class OraclePipeline {
  private client: Anthropic;
  private temporalBuffer: TemporalBufferEntry[] = [];
  private maxBufferSize = 100;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  private stages: StageDefinition[] = [
    {
      name: 'Ontological Reasoning',
      prompt: (input: string) => `
Input: ${input}

Analyze this using the elemental reasoning map:
- Fire = teleological (purpose, goals, direction)
- Water = phenomenological (experience, emotion, flow)
- Earth = empirical (facts, structure, evidence)
- Air = analytical (patterns, models, concepts)
- Aether = metacognitive (synthesis, transcendence)

Generate one short insight per element.`
    },
    {
      name: 'Temporal Expansion',
      prompt: `Expand temporally:
- Past echoes: what patterns or influences are visible?
- Present clarity: what is happening now?
- Future trajectory: where could this evolve?`
    },
    {
      name: 'Implicit Insight Detection',
      prompt: `Identify implicit dimensions:
- Explicit: clearly stated
- Implied: suggested but unsaid
- Emergent: patterns across time
- Shadow: avoided or denied
- Resonant: mythic/archetypal parallels`
    },
    {
      name: 'Spiralogic Mapping',
      prompt: `Map into the Spiralogic cycle:
- Recognition (Air): identify the pattern
- Feeling (Water): explore emotional depth
- Grounding (Earth): validate against reality
- Activation (Fire): what action is invited
- Integration (Aether): contribution to wholeness

Create a compact narrative through these stages.`
    },
    {
      name: 'Output Shaping',
      prompt: `Reframe into:
1. One reflection question
2. One micro-practice (simple, doable now)
3. One mythic/archetypal image

Keep it concise but soulful.`
    }
  ];

  async runPipeline(
    userText: string,
    options: {
      debug?: boolean;
      userId?: string;
      sessionId?: string;
      useTemporalContext?: boolean;
    } = {}
  ): Promise<PipelineResult> {
    const sessionId = options.sessionId || this.generateSessionId();
    const history: StageResult[] = [];
    let lastOutput = userText;

    // Inject temporal context if requested
    if (options.useTemporalContext) {
      const context = this.getTemporalContext(options.userId);
      if (context) {
        userText = `${userText}\n\n[Temporal Context: ${context}]`;
      }
    }

    // Run through stages
    for (const stage of this.stages) {
      const promptText = typeof stage.prompt === 'function' 
        ? stage.prompt(lastOutput)
        : `Prior analysis:\n${lastOutput}\n\n${stage.prompt}`;

      const response = await this.client.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 600,
        messages: [{ role: 'user', content: promptText }]
      });

      const stageOutput = response.content[0].text;
      
      history.push({
        stage: stage.name,
        output: stageOutput,
        timestamp: Date.now()
      });

      lastOutput = stageOutput;
    }

    // Extract elemental insights from first stage
    const elements = this.extractElements(history[0].output);

    // Store in temporal buffer
    this.addToTemporalBuffer({
      sessionId,
      userId: options.userId,
      input: userText,
      stages: history,
      timestamp: Date.now(),
      elements
    });

    // Return results
    if (options.debug) {
      return {
        final: history[history.length - 1].output,
        stages: history,
        elements,
        sessionId
      };
    }

    return {
      final: history[history.length - 1].output,
      sessionId
    };
  }

  private extractElements(ontologicalOutput: string): Record<string, string> {
    const elements: Record<string, string> = {};
    const patterns = [
      /Fire[:\s]*(.+)/i,
      /Water[:\s]*(.+)/i,
      /Earth[:\s]*(.+)/i,
      /Air[:\s]*(.+)/i,
      /Aether[:\s]*(.+)/i
    ];

    for (const pattern of patterns) {
      const match = ontologicalOutput.match(pattern);
      if (match) {
        const element = pattern.source.split('[')[0].toLowerCase();
        elements[element] = match[1].trim();
      }
    }

    return elements;
  }

  private addToTemporalBuffer(entry: TemporalBufferEntry): void {
    this.temporalBuffer.push(entry);
    
    // Maintain buffer size limit
    if (this.temporalBuffer.length > this.maxBufferSize) {
      this.temporalBuffer.shift();
    }
  }

  private getTemporalContext(userId?: string): string | null {
    const relevantEntries = userId
      ? this.temporalBuffer.filter(e => e.userId === userId).slice(-3)
      : this.temporalBuffer.slice(-3);

    if (relevantEntries.length === 0) return null;

    // Synthesize patterns from recent sessions
    const patterns = relevantEntries.map(entry => {
      const dominant = this.getDominantElement(entry.elements);
      return `${dominant} pattern from ${new Date(entry.timestamp).toISOString()}`;
    });

    return `Recent patterns: ${patterns.join(', ')}`;
  }

  private getDominantElement(elements: Record<string, string>): string {
    // Simple heuristic: longest insight = most engaged element
    let dominant = 'balanced';
    let maxLength = 0;

    for (const [element, insight] of Object.entries(elements)) {
      if (insight.length > maxLength) {
        maxLength = insight.length;
        dominant = element;
      }
    }

    return dominant;
  }

  private generateSessionId(): string {
    return `oracle-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  // Persistence methods (to be connected to your DB)
  async saveToDatabase(entry: TemporalBufferEntry): Promise<void> {
    // TODO: Connect to Supabase or your persistence layer
    console.log('Would save to DB:', entry.sessionId);
  }

  async loadTemporalBuffer(userId: string, limit: number = 10): Promise<void> {
    // TODO: Load recent sessions from DB
    console.log('Would load from DB for user:', userId);
  }

  // Pattern recognition across sessions
  analyzePatterns(userId: string): {
    dominantElement: string;
    recurringThemes: string[];
    evolutionArc: string;
  } {
    const userEntries = this.temporalBuffer.filter(e => e.userId === userId);
    
    if (userEntries.length === 0) {
      return {
        dominantElement: 'none',
        recurringThemes: [],
        evolutionArc: 'no data'
      };
    }

    // Count element frequencies
    const elementCounts: Record<string, number> = {};
    for (const entry of userEntries) {
      const dominant = this.getDominantElement(entry.elements);
      elementCounts[dominant] = (elementCounts[dominant] || 0) + 1;
    }

    // Find most common element
    const dominantElement = Object.entries(elementCounts)
      .sort(([,a], [,b]) => b - a)[0][0];

    // Extract recurring words/themes (simplified)
    const allText = userEntries.map(e => e.input).join(' ');
    const words = allText.toLowerCase().split(/\s+/);
    const wordFreq: Record<string, number> = {};
    
    for (const word of words) {
      if (word.length > 5) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    }

    const recurringThemes = Object.entries(wordFreq)
      .filter(([,count]) => count > 2)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);

    // Detect evolution (first entry vs last)
    const firstDominant = this.getDominantElement(userEntries[0].elements);
    const lastDominant = this.getDominantElement(userEntries[userEntries.length - 1].elements);
    const evolutionArc = firstDominant === lastDominant 
      ? `stable ${firstDominant}` 
      : `${firstDominant} → ${lastDominant}`;

    return {
      dominantElement,
      recurringThemes,
      evolutionArc
    };
  }
}

// Export for use in your API routes
export default OraclePipeline;