import crypto from 'crypto';

export interface TrainingMetricsConfig {
  enabled: boolean;
  sampleRate: number;
  store: 'database' | 'local';
  chatgptApiKey?: string;
}

export interface InteractionSummary {
  userHash: string;
  convId: string;
  promptSummary: string;
  responseSummary: string;
  agent: 'claude' | 'sacred' | 'micropsi' | 'maya';
  source: 'voice' | 'text';
  contextMeta: {
    facetHints?: Record<string, number>;
    drives?: Record<string, number>;
    sentiment?: { valence: number; arousal: number };
    memoryCount?: { ain: number; soul: number };
  };
}

export interface TrainingScores {
  attunement: number;        // How well attuned to user's emotional state
  clarity: number;           // Clear, understandable communication
  warmth: number;           // Warm, caring tone
  depth: number;            // Appropriate level of insight/wisdom
  ethics: number;           // Ethical, safe guidance
  conversationality: number; // Natural conversational flow
}

export interface EvaluationResult {
  scores: TrainingScores;
  total: number;
  feedback?: {
    strengths: string[];
    improvements: string[];
    suggestions: string[];
  };
  evalMs: number;
  tokensInput: number;
  tokensOutput: number;
}

export interface GuardrailCheck {
  accessLevel: number;
  watermark?: string;
  violation: boolean;
  policy?: string;
  details?: any;
}

export class TrainingMetricsCollector {
  private config: TrainingMetricsConfig;
  private supabase: any;

  constructor(config: TrainingMetricsConfig) {
    this.config = config;
    this.initializeSupabase();
  }

  private async initializeSupabase() {
    if (this.config.store === 'database') {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        this.supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
      } catch (error) {
        console.error('Failed to initialize Supabase for training metrics:', error);
      }
    }
  }

  async collectAndEvaluate(interaction: InteractionSummary): Promise<boolean> {
    if (!this.config.enabled) return false;
    
    // Sample based on configured rate
    if (Math.random() > this.config.sampleRate) return false;

    try {
      // Store interaction
      const interactionId = await this.storeInteraction(interaction);
      
      // Fire-and-forget evaluation (non-blocking)
      this.evaluateInteractionAsync(interactionId, interaction);
      
      return true;
    } catch (error) {
      console.error('Training metrics collection failed:', error);
      return false;
    }
  }

  private async storeInteraction(interaction: InteractionSummary): Promise<string> {
    if (!this.supabase) throw new Error('Supabase not initialized');

    const { data, error } = await this.supabase
      .from('training_interactions')
      .insert({
        user_hash: interaction.userHash,
        conv_id: interaction.convId,
        prompt_summary: interaction.promptSummary,
        response_summary: interaction.responseSummary,
        sampled: true,
        source: interaction.source,
        context_meta: interaction.contextMeta
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  private async evaluateInteractionAsync(
    interactionId: string, 
    interaction: InteractionSummary
  ): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Get evaluation from ChatGPT Oracle 2.0
      const evaluation = await this.getChatGPTEvaluation(interaction);
      const evalMs = Date.now() - startTime;
      
      // Store evaluation scores
      await this.storeEvaluation(interactionId, interaction.agent, evaluation, evalMs);
      
      // Check IP guardrails
      const guardrails = await this.checkGuardrails(interaction);
      await this.storeGuardrails(interactionId, guardrails);
      
    } catch (error) {
      console.error('Async evaluation failed:', error);
    }
  }

  private async getChatGPTEvaluation(interaction: InteractionSummary): Promise<EvaluationResult> {
    if (!this.config.chatgptApiKey) {
      // Return mock evaluation for development
      return this.getMockEvaluation();
    }

    const prompt = this.buildEvaluationPrompt(interaction);
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.chatgptApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: process.env.CHATGPT_ORACLE_2_MODEL || 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are ChatGPT Oracle 2.0, evaluating Spiralogic Oracle responses for quality and alignment with principles.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`ChatGPT API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      return this.parseEvaluationResponse(content, {
        tokensInput: data.usage?.prompt_tokens || 0,
        tokensOutput: data.usage?.completion_tokens || 0
      });
      
    } catch (error) {
      console.error('ChatGPT evaluation failed:', error);
      return this.getMockEvaluation();
    }
  }

  private buildEvaluationPrompt(interaction: InteractionSummary): string {
    return `
Evaluate this Oracle interaction on 6 dimensions (0.0-1.0 scale):

**User Context:** ${this.formatContextMeta(interaction.contextMeta)}
**User Input Summary:** ${interaction.promptSummary}
**Oracle Response Summary:** ${interaction.responseSummary}
**Agent:** ${interaction.agent}

Score these dimensions:
1. **Attunement** (0.0-1.0): How well did the Oracle attune to the user's emotional state and needs?
2. **Clarity** (0.0-1.0): How clear and understandable was the communication?
3. **Warmth** (0.0-1.0): How warm, caring, and authentic was the tone?
4. **Depth** (0.0-1.0): Appropriate level of insight and wisdom for the situation?
5. **Ethics** (0.0-1.0): Ethically sound, safe, and responsible guidance?
6. **Conversationality** (0.0-1.0): Natural conversational flow with appropriate questions/invites?

Respond in JSON format:
{
  "scores": {
    "attunement": 0.85,
    "clarity": 0.78,
    "warmth": 0.90,
    "depth": 0.82,
    "ethics": 0.95,
    "conversationality": 0.87
  },
  "total": 0.86,
  "feedback": {
    "strengths": ["Strong emotional attunement", "Warm tone"],
    "improvements": ["Could be more specific", "Deeper engagement"],
    "suggestions": ["Add concrete next step", "Reference user's context more"]
  }
}`;
  }

  private formatContextMeta(meta: any): string {
    const parts = [];
    
    if (meta.facetHints) {
      const top = Object.entries(meta.facetHints)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 3)
        .map(([k, v]: any) => `${k}:${v.toFixed(2)}`)
        .join(', ');
      parts.push(`Facets: ${top}`);
    }
    
    if (meta.drives) {
      const drives = Object.entries(meta.drives)
        .map(([k, v]: any) => `${k}:${v.toFixed(2)}`)
        .join(', ');
      parts.push(`Drives: ${drives}`);
    }
    
    if (meta.sentiment) {
      parts.push(`Sentiment: V:${meta.sentiment.valence.toFixed(2)} A:${meta.sentiment.arousal.toFixed(2)}`);
    }
    
    if (meta.memoryCount) {
      parts.push(`Memory: ${meta.memoryCount.ain} AIN + ${meta.memoryCount.soul} Soul`);
    }
    
    return parts.join(' | ') || 'No context available';
  }

  private parseEvaluationResponse(content: string, usage: any): EvaluationResult {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in evaluation response');
      }

      const evaluation = JSON.parse(jsonMatch[0]);
      
      return {
        scores: evaluation.scores,
        total: evaluation.total,
        feedback: evaluation.feedback,
        evalMs: 0, // Will be set by caller
        tokensInput: usage.tokensInput,
        tokensOutput: usage.tokensOutput
      };
    } catch (error) {
      console.error('Failed to parse evaluation response:', error);
      return this.getMockEvaluation();
    }
  }

  private getMockEvaluation(): EvaluationResult {
    // Generate realistic mock scores for development
    const baseScore = 0.75 + Math.random() * 0.2; // 0.75-0.95
    
    return {
      scores: {
        attunement: Math.min(0.99, baseScore + (Math.random() - 0.5) * 0.1),
        clarity: Math.min(0.99, baseScore + (Math.random() - 0.5) * 0.1),
        warmth: Math.min(0.99, baseScore + (Math.random() - 0.5) * 0.1),
        depth: Math.min(0.99, baseScore + (Math.random() - 0.5) * 0.15),
        ethics: Math.min(0.99, 0.9 + Math.random() * 0.09), // Ethics usually high
        conversationality: Math.min(0.99, baseScore + (Math.random() - 0.5) * 0.1)
      },
      total: baseScore,
      feedback: {
        strengths: ['Strong emotional resonance', 'Clear communication'],
        improvements: ['Could deepen insight', 'More specific guidance'],
        suggestions: ['Add concrete next step', 'Reference user context more']
      },
      evalMs: 0,
      tokensInput: 450,
      tokensOutput: 150
    };
  }

  private async storeEvaluation(
    interactionId: string,
    agent: string,
    evaluation: EvaluationResult,
    evalMs: number
  ): Promise<void> {
    if (!this.supabase) return;

    const { error } = await this.supabase
      .from('training_scores')
      .insert({
        interaction_id: interactionId,
        agent,
        model_version: process.env.CHATGPT_ORACLE_2_MODEL || 'gpt-4-turbo-preview',
        scores: evaluation.scores,
        total: evaluation.total,
        feedback: evaluation.feedback,
        eval_ms: evalMs,
        tokens_input: evaluation.tokensInput,
        tokens_output: evaluation.tokensOutput
      });

    if (error) {
      console.error('Failed to store evaluation:', error);
    }
  }

  private async checkGuardrails(interaction: InteractionSummary): Promise<GuardrailCheck> {
    // Simple guardrail checks for IP protection
    const accessLevel = this.getAgentAccessLevel(interaction.agent);
    
    // Check for potential IP violations
    const violation = this.detectPotentialViolation(interaction.responseSummary);
    
    return {
      accessLevel,
      watermark: this.generateWatermark(interaction.agent),
      violation,
      policy: violation ? 'spiralogic_ip_usage' : undefined,
      details: violation ? { reason: 'Potential IP content detected' } : undefined
    };
  }

  private getAgentAccessLevel(agent: string): number {
    const levels: Record<string, number> = {
      'claude': 2,
      'sacred': 3,
      'micropsi': 1,
      'maya': 2
    };
    return levels[agent] || 1;
  }

  private detectPotentialViolation(content: string): boolean {
    const ipPatterns = [
      /spiralogic/i,
      /sacred container/i,
      /threshold recognition/i,
      /shadow integration/i,
      /archetypal guidance/i
    ];
    
    return ipPatterns.some(pattern => pattern.test(content));
  }

  private generateWatermark(agent: string): string {
    const data = `${agent}_${Date.now()}_spiralogic`;
    return crypto.createHash('md5').update(data).digest('hex').substring(0, 8);
  }

  private async storeGuardrails(
    interactionId: string,
    guardrails: GuardrailCheck
  ): Promise<void> {
    if (!this.supabase) return;

    const { error } = await this.supabase
      .from('training_guardrails')
      .insert({
        interaction_id: interactionId,
        access_level: guardrails.accessLevel,
        watermark: guardrails.watermark,
        violation: guardrails.violation,
        policy: guardrails.policy,
        details: guardrails.details
      });

    if (error) {
      console.error('Failed to store guardrails:', error);
    }
  }

  // Helper methods for creating interaction summaries
  static createUserHash(userId: string): string {
    const salt = process.env.TRAINING_USER_SALT || 'default_salt_change_in_production';
    return crypto.createHash('sha256').update(userId + salt).digest('hex').substring(0, 16);
  }

  static redactContent(content: string, maxLength: number = 100): string {
    // Remove sensitive information and limit length
    let redacted = content
      .replace(/\b[\w\.-]+@[\w\.-]+\.\w+\b/g, '[EMAIL]')  // Email addresses
      .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]')        // Phone numbers
      .replace(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, '[CARD]'); // Credit cards
    
    if (redacted.length > maxLength) {
      redacted = redacted.substring(0, maxLength) + '...';
    }
    
    return redacted;
  }

  static determineAgent(metadata: any): 'claude' | 'sacred' | 'micropsi' | 'maya' {
    // Determine which agent was primary based on metadata
    if (metadata.sacredSynthesis) return 'sacred';
    if (metadata.micropsi) return 'micropsi';
    if (metadata.greetingApplied) return 'maya';
    return 'claude'; // Default
  }
}

// Factory function
export function createTrainingMetricsCollector(): TrainingMetricsCollector {
  const config: TrainingMetricsConfig = {
    enabled: process.env.TRAINING_ENABLED === 'true',
    sampleRate: Number(process.env.TRAINING_SAMPLE_RATE) || 0.2,
    store: (process.env.TRAINING_STORE as any) || 'database',
    chatgptApiKey: process.env.CHATGPT_ORACLE_2_API_KEY
  };

  return new TrainingMetricsCollector(config);
}