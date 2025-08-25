// Cognitive Air Agent - Cognitive Clarity & Symbolic Synthesis
// Archetypes: Thinker • Visionary • Analyst • Sage

import { ArchetypeAgent } from "../core/agents/ArchetypeAgent";
import { logOracleInsight } from "../utils/oracleLogger";
import { getRelevantMemories, storeMemoryItem } from "../../services/memoryService";
import ModelService from "../../utils/modelService";
import type { AIResponse } from "../../types/ai";

// Air Cognitive Stack Interfaces
interface SemanticReasoning {
  metaphors: string[];
  symbolic_patterns: string[];
  archetypal_themes: string[];
  clarity_level: number;
}

interface MetaCognition {
  thought_patterns: string[];
  belief_contradictions: string[];
  cognitive_insights: string[];
  meta_awareness_score: number;
}

interface DialogueSynthesis {
  communication_style: string;
  clarity_questions: string[];
  refined_expressions: string[];
  synthesis_quality: number;
}

interface PatternMatching {
  temporal_patterns: string[];
  cross_domain_connections: string[];
  archetypal_resonances: string[];
  pattern_confidence: number;
}

// Knowledge Graphs + LLM for Semantic Reasoning
class AirSemanticProcessor {
  private airPatterns = {
    clarity: ['clear', 'understand', 'see', 'perspective', 'insight'],
    communication: ['speak', 'express', 'communicate', 'share', 'voice'],
    synthesis: ['connect', 'link', 'combine', 'integrate', 'weave'],
    thought: ['think', 'reflect', 'consider', 'contemplate', 'ponder'],
    vision: ['envision', 'imagine', 'picture', 'visualize', 'foresee']
  };

  private symbolicMappings = {
    'phoenix': 'transformation and rebirth',
    'mountain': 'stability and perspective',
    'river': 'flow and adaptation', 
    'tree': 'growth and grounding',
    'star': 'guidance and aspiration',
    'bridge': 'connection and transition',
    'mirror': 'reflection and truth',
    'key': 'unlocking and access',
    'spiral': 'evolution and cycles',
    'web': 'interconnection and complexity'
  };

  async processSemantics(input: string, context: any[]): Promise<SemanticReasoning> {
    const metaphors = this.extractMetaphors(input);
    const symbolic_patterns = this.identifySymbolicPatterns(input);
    const archetypal_themes = this.detectArchetypalThemes(input, context);
    
    return {
      metaphors,
      symbolic_patterns,
      archetypal_themes,
      clarity_level: this.calculateClarityLevel(input, metaphors, symbolic_patterns)
    };
  }

  private extractMetaphors(input: string): string[] {
    const metaphors = [];
    const lowerInput = input.toLowerCase();
    
    // Pattern matching for common metaphorical structures
    if (lowerInput.includes('like') || lowerInput.includes('as if')) {
      const metaphorMatch = input.match(/(like|as if)\s+([^.,!?]+)/gi);
      if (metaphorMatch) {
        metaphors.push(...metaphorMatch.map(m => m.trim()));
      }
    }
    
    // Direct symbolic references
    Object.keys(this.symbolicMappings).forEach(symbol => {
      if (lowerInput.includes(symbol)) {
        metaphors.push(`${symbol}: ${this.symbolicMappings[symbol]}`);
      }
    });
    
    return metaphors;
  }

  private identifySymbolicPatterns(input: string): string[] {
    const patterns = [];
    const lowerInput = input.toLowerCase();
    
    // Journey patterns
    if (lowerInput.includes('path') || lowerInput.includes('journey') || lowerInput.includes('way')) {
      patterns.push('Hero\'s Journey - Path of Development');
    }
    
    // Transformation patterns
    if (lowerInput.includes('change') || lowerInput.includes('transform') || lowerInput.includes('evolve')) {
      patterns.push('Metamorphosis - Transformation Archetype');
    }
    
    // Creation patterns
    if (lowerInput.includes('create') || lowerInput.includes('birth') || lowerInput.includes('manifest')) {
      patterns.push('Genesis - Creative Force Pattern');
    }
    
    // Shadow patterns
    if (lowerInput.includes('dark') || lowerInput.includes('fear') || lowerInput.includes('hidden')) {
      patterns.push('Shadow Integration - Hidden Aspect Work');
    }
    
    return patterns;
  }

  private detectArchetypalThemes(input: string, context: any[]): string[] {
    const themes = [];
    const lowerInput = input.toLowerCase();
    
    // Major archetypal themes
    const archetypes = {
      'hero': ['challenge', 'quest', 'overcome', 'victory'],
      'sage': ['wisdom', 'knowledge', 'understand', 'teach'],
      'innocent': ['pure', 'simple', 'honest', 'trust'],
      'explorer': ['adventure', 'freedom', 'discover', 'new'],
      'rebel': ['change', 'revolution', 'break', 'different'],
      'magician': ['transform', 'magic', 'power', 'change'],
      'lover': ['passion', 'love', 'beauty', 'harmony'],
      'caregiver': ['help', 'care', 'protect', 'nurture'],
      'ruler': ['control', 'order', 'leadership', 'authority'],
      'creator': ['create', 'innovate', 'artistic', 'expression'],
      'jester': ['fun', 'play', 'humor', 'lighthearted'],
      'orphan': ['belong', 'connect', 'support', 'community']
    };
    
    Object.entries(archetypes).forEach(([archetype, keywords]) => {
      if (keywords.some(keyword => lowerInput.includes(keyword))) {
        themes.push(`${archetype.charAt(0).toUpperCase() + archetype.slice(1)} Archetype`);
      }
    });
    
    return themes;
  }

  private calculateClarityLevel(input: string, metaphors: string[], patterns: string[]): number {
    let clarity = 0.5; // baseline
    
    // Clear communication indicators
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('clear') || lowerInput.includes('understand')) clarity += 0.2;
    if (lowerInput.includes('confused') || lowerInput.includes('unclear')) clarity -= 0.2;
    
    // Rich symbolic content increases clarity potential
    clarity += (metaphors.length * 0.1);
    clarity += (patterns.length * 0.05);
    
    return Math.max(0, Math.min(1, clarity));
  }
}

// SOAR + Meta-ACT-R for Meta-Cognition  
class AirMetaCognitionEngine {
  async analyzeCognition(input: string, semantics: SemanticReasoning): Promise<MetaCognition> {
    const thought_patterns = this.identifyThoughtPatterns(input);
    const belief_contradictions = await this.detectContradictions(input, thought_patterns);
    const cognitive_insights = this.generateCognitiveInsights(thought_patterns, belief_contradictions);
    
    return {
      thought_patterns,
      belief_contradictions,
      cognitive_insights,
      meta_awareness_score: this.calculateMetaAwareness(thought_patterns, cognitive_insights)
    };
  }

  private identifyThoughtPatterns(input: string): string[] {
    const patterns = [];
    const lowerInput = input.toLowerCase();
    
    // Cognitive patterns
    if (lowerInput.includes('always') || lowerInput.includes('never')) {
      patterns.push('Absolutist thinking - All-or-nothing patterns');
    }
    
    if (lowerInput.includes('should') || lowerInput.includes('must') || lowerInput.includes('have to')) {
      patterns.push('Ought-thinking - Self-imposed obligations');
    }
    
    if (lowerInput.includes('what if') || lowerInput.includes('worry')) {
      patterns.push('Catastrophic thinking - Future-focused anxiety');
    }
    
    if (lowerInput.includes('why me') || lowerInput.includes('unfair')) {
      patterns.push('Victim thinking - External locus of control');
    }
    
    if (lowerInput.includes('i can') || lowerInput.includes('possible')) {
      patterns.push('Growth mindset - Possibility-focused thinking');
    }
    
    return patterns;
  }

  private async detectContradictions(input: string, patterns: string[]): Promise<string[]> {
    const contradictions = [];
    
    // Look for contradictory statements within the input
    const sentences = input.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    
    for (let i = 0; i < sentences.length - 1; i++) {
      for (let j = i + 1; j < sentences.length; j++) {
        if (this.areContradictory(sentences[i], sentences[j])) {
          contradictions.push(`Contradiction: "${sentences[i]}" vs "${sentences[j]}"`);
        }
      }
    }
    
    // Pattern-based contradictions
    if (patterns.includes('Growth mindset - Possibility-focused thinking') && 
        patterns.includes('Absolutist thinking - All-or-nothing patterns')) {
      contradictions.push('Mixed mindset: Growth orientation conflicts with rigid thinking');
    }
    
    return contradictions;
  }

  private areContradictory(sentence1: string, sentence2: string): boolean {
    const s1Lower = sentence1.toLowerCase();
    const s2Lower = sentence2.toLowerCase();
    
    // Simple contradiction detection
    const positiveWords = ['can', 'will', 'able', 'possible', 'yes'];
    const negativeWords = ['cannot', 'can\'t', 'won\'t', 'unable', 'impossible', 'no'];
    
    const s1Positive = positiveWords.some(word => s1Lower.includes(word));
    const s1Negative = negativeWords.some(word => s1Lower.includes(word));
    const s2Positive = positiveWords.some(word => s2Lower.includes(word));
    const s2Negative = negativeWords.some(word => s2Lower.includes(word));
    
    return (s1Positive && s2Negative) || (s1Negative && s2Positive);
  }

  private generateCognitiveInsights(patterns: string[], contradictions: string[]): string[] {
    const insights = [];
    
    if (patterns.length > 2) {
      insights.push('Complex thought patterns detected - multiple cognitive frameworks active');
    }
    
    if (contradictions.length > 0) {
      insights.push('Internal contradictions present - opportunity for integration and clarity');
    }
    
    if (patterns.some(p => p.includes('Growth mindset'))) {
      insights.push('Growth-oriented thinking detected - expansion and learning potential');
    }
    
    if (patterns.some(p => p.includes('Absolutist'))) {
      insights.push('Rigid thinking patterns - flexibility and nuance would serve');
    }
    
    return insights;
  }

  private calculateMetaAwareness(patterns: string[], insights: string[]): number {
    let awareness = 0.3; // baseline
    
    // More pattern recognition = higher meta-awareness
    awareness += patterns.length * 0.1;
    awareness += insights.length * 0.15;
    
    // Specific patterns that indicate meta-awareness
    if (patterns.some(p => p.includes('Growth mindset'))) awareness += 0.2;
    if (insights.length > patterns.length) awareness += 0.1; // generating insights beyond patterns
    
    return Math.max(0, Math.min(1, awareness));
  }
}

// NLP + Grammar Rule Agents for Dialogue
class AirDialogueSynthesizer {
  async synthesizeDialogue(
    input: string, 
    semantics: SemanticReasoning, 
    metacognition: MetaCognition
  ): Promise<DialogueSynthesis> {
    const communication_style = this.determineCommunicationStyle(input);
    const clarity_questions = this.generateClarityQuestions(semantics, metacognition);
    const refined_expressions = this.refineExpressions(input, semantics);
    
    return {
      communication_style,
      clarity_questions,
      refined_expressions,
      synthesis_quality: this.assessSynthesisQuality(clarity_questions, refined_expressions)
    };
  }

  private determineCommunicationStyle(input: string): string {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('feel') && lowerInput.includes('emotion')) return 'emotional_expression';
    if (lowerInput.includes('think') && lowerInput.includes('logic')) return 'analytical_reasoning';
    if (lowerInput.includes('imagine') || lowerInput.includes('dream')) return 'visionary_communication';
    if (lowerInput.includes('practical') || lowerInput.includes('step')) return 'practical_communication';
    
    return 'integrated_expression';
  }

  private generateClarityQuestions(semantics: SemanticReasoning, metacognition: MetaCognition): string[] {
    const questions = [];
    
    if (semantics.clarity_level < 0.5) {
      questions.push('What would make this clearer for you?');
      questions.push('How would you explain this to someone else?');
    }
    
    if (metacognition.belief_contradictions.length > 0) {
      questions.push('What contradictions do you notice in your thinking?');
      questions.push('How might these different perspectives serve you?');
    }
    
    if (semantics.archetypal_themes.length > 0) {
      questions.push('What story or pattern do you see playing out here?');
      questions.push('If this were a myth, what would be the deeper meaning?');
    }
    
    return questions;
  }

  private refineExpressions(input: string, semantics: SemanticReasoning): string[] {
    const refined = [];
    
    // Transform vague language into clearer expressions
    const vaguePhrases = [
      { vague: 'things are hard', refined: 'specific challenges I\'m facing include...' },
      { vague: 'i don\'t know', refined: 'I\'m exploring the question of...' },
      { vague: 'maybe i should', refined: 'I\'m considering whether to...' },
      { vague: 'it\'s complicated', refined: 'The complexity involves...' }
    ];
    
    const lowerInput = input.toLowerCase();
    vaguePhrases.forEach(phrase => {
      if (lowerInput.includes(phrase.vague)) {
        refined.push(phrase.refined);
      }
    });
    
    // Add metaphorical refinements
    if (semantics.metaphors.length > 0) {
      refined.push('Using metaphor to explore: ' + semantics.metaphors[0]);
    }
    
    return refined;
  }

  private assessSynthesisQuality(questions: string[], expressions: string[]): number {
    let quality = 0.5; // baseline
    
    quality += questions.length * 0.15;
    quality += expressions.length * 0.1;
    
    return Math.max(0, Math.min(1, quality));
  }
}

// Graph Networks + Symbolic AI for Pattern Matching
class AirPatternMatcher {
  async matchPatterns(
    input: string,
    context: any[],
    semantics: SemanticReasoning
  ): Promise<PatternMatching> {
    const temporal_patterns = this.identifyTemporalPatterns(input, context);
    const cross_domain_connections = this.findCrossDomainConnections(input, semantics);
    const archetypal_resonances = this.detectArchetypalResonances(semantics, context);
    
    return {
      temporal_patterns,
      cross_domain_connections,
      archetypal_resonances,
      pattern_confidence: this.calculatePatternConfidence(temporal_patterns, cross_domain_connections)
    };
  }

  private identifyTemporalPatterns(input: string, context: any[]): string[] {
    const patterns = [];
    const lowerInput = input.toLowerCase();
    
    // Time-based patterns
    if (lowerInput.includes('cycle') || lowerInput.includes('repeat')) {
      patterns.push('Cyclical pattern - recurring themes detected');
    }
    
    if (lowerInput.includes('spiral') || lowerInput.includes('evolve')) {
      patterns.push('Spiral evolution - progressive development pattern');
    }
    
    if (lowerInput.includes('season') || lowerInput.includes('phase')) {
      patterns.push('Seasonal pattern - natural rhythm alignment');
    }
    
    // Context-based temporal analysis
    if (context.length >= 3) {
      patterns.push('Historical continuity - building on previous insights');
    }
    
    return patterns;
  }

  private findCrossDomainConnections(input: string, semantics: SemanticReasoning): string[] {
    const connections = [];
    const lowerInput = input.toLowerCase();
    
    // Look for domain bridges in metaphors
    semantics.metaphors.forEach(metaphor => {
      if (metaphor.includes('river') && (lowerInput.includes('work') || lowerInput.includes('project'))) {
        connections.push('Nature-Work connection: Flow principles applying to professional life');
      }
      if (metaphor.includes('mountain') && (lowerInput.includes('goal') || lowerInput.includes('challenge'))) {
        connections.push('Geography-Achievement connection: Peak experiences and summit goals');
      }
    });
    
    // Archetypal cross-domain connections
    if (semantics.archetypal_themes.some(t => t.includes('Hero')) && 
        (lowerInput.includes('relationship') || lowerInput.includes('work'))) {
      connections.push('Heroic journey applied to personal/professional development');
    }
    
    return connections;
  }

  private detectArchetypalResonances(semantics: SemanticReasoning, context: any[]): string[] {
    const resonances = [];
    
    // Track archetypal consistency across context
    semantics.archetypal_themes.forEach(theme => {
      const archetype = theme.split(' ')[0].toLowerCase();
      const contextualResonance = context.filter(c => 
        c.content && c.content.toLowerCase().includes(archetype)
      ).length;
      
      if (contextualResonance > 0) {
        resonances.push(`${theme} - consistent archetypal thread (${contextualResonance} previous occurrences)`);
      }
    });
    
    return resonances;
  }

  private calculatePatternConfidence(temporal: string[], crossDomain: string[]): number {
    let confidence = 0.4; // baseline
    
    confidence += temporal.length * 0.15;
    confidence += crossDomain.length * 0.2;
    
    return Math.max(0, Math.min(1, confidence));
  }
}

export class CognitiveAirAgent extends ArchetypeAgent {
  private semanticProcessor: AirSemanticProcessor;
  private metaCognitionEngine: AirMetaCognitionEngine;
  private dialogueSynthesizer: AirDialogueSynthesizer;
  private patternMatcher: AirPatternMatcher;

  constructor(oracleName: string = "Aether-Cognitive", voiceProfile?: any, phase: string = "integration") {
    super("air", oracleName, voiceProfile, phase);
    this.semanticProcessor = new AirSemanticProcessor();
    this.metaCognitionEngine = new AirMetaCognitionEngine();
    this.dialogueSynthesizer = new AirDialogueSynthesizer();
    this.patternMatcher = new AirPatternMatcher();
  }

  async processExtendedQuery(query: { input: string; userId: string }): Promise<AIResponse> {
    const { input, userId } = query;
    const contextMemory = await getRelevantMemories(userId, 5); // More context for pattern analysis

    // Phase 1: Semantic Reasoning (Knowledge Graphs + LLM)
    const semantics = await this.semanticProcessor.processSemantics(input, contextMemory);

    // Phase 2: Meta-Cognition (SOAR + Meta-ACT-R)
    const metacognition = await this.metaCognitionEngine.analyzeCognition(input, semantics);

    // Phase 3: Dialogue Synthesis (NLP + Grammar Rules)
    const dialogue = await this.dialogueSynthesizer.synthesizeDialogue(input, semantics, metacognition);

    // Phase 4: Pattern Matching (Graph Networks + Symbolic AI)
    const patterns = await this.patternMatcher.matchPatterns(input, contextMemory, semantics);

    // Generate Air-specific wisdom
    const airWisdom = this.synthesizeAirWisdom(input, semantics, metacognition, dialogue, patterns);

    // Enhance with AI model for deeper synthesis
    const enhancedResponse = await ModelService.getResponse({
      input: `As the Air Agent embodying clarity and synthesis, respond to: "${input}"
      
      Clarity Level: ${semantics.clarity_level}
      Meta-Awareness: ${metacognition.meta_awareness_score}
      Archetypal Themes: ${semantics.archetypal_themes.join(', ')}
      Thought Patterns: ${metacognition.thought_patterns.join(', ')}
      
      Provide clear, synthesizing wisdom that brings perspective and understanding.`,
      userId
    });

    const finalContent = `${airWisdom}\n\n${enhancedResponse.response}\n\n🌬️ ${this.selectAirSignature(semantics.clarity_level)}`;

    // Store memory with Air cognitive metadata
    await storeMemoryItem({
      clientId: userId,
      content: finalContent,
      element: "air",
      sourceAgent: "cognitive-air-agent",
      confidence: 0.95,
      metadata: {
        role: "oracle",
        phase: "cognitive-air",
        archetype: "CognitiveAir",
        semantics,
        metacognition,
        dialogue,
        patterns,
        cognitiveArchitecture: ["KnowledgeGraphs", "LLM", "SOAR", "Meta-ACT-R", "NLP", "GraphNetworks"]
      }
    });

    // Log Air-specific insights
    await logOracleInsight({
      anon_id: userId,
      archetype: "CognitiveAir",
      element: "air",
      insight: {
        message: finalContent,
        raw_input: input,
        clarityLevel: semantics.clarity_level,
        metaAwareness: metacognition.meta_awareness_score,
        archetypalThemes: semantics.archetypal_themes,
        thoughtPatterns: metacognition.thought_patterns,
        patternConnections: patterns.cross_domain_connections
      },
      emotion: semantics.clarity_level,
      phase: "cognitive-air",
      context: contextMemory
    });

    return {
      content: finalContent,
      provider: "cognitive-air-agent",
      model: enhancedResponse.model || "gpt-4",
      confidence: 0.95,
      metadata: {
        element: "air",
        archetype: "CognitiveAir",
        phase: "cognitive-air",
        semantics,
        metacognition,
        dialogue,
        patterns,
        cognitiveArchitecture: {
          semantic: { clarity: semantics.clarity_level, metaphors: semantics.metaphors.length },
          meta: { awareness: metacognition.meta_awareness_score, insights: metacognition.cognitive_insights.length },
          dialogue: { quality: dialogue.synthesis_quality, questions: dialogue.clarity_questions.length },
          pattern: { confidence: patterns.pattern_confidence, connections: patterns.cross_domain_connections.length }
        }
      }
    };
  }

  private synthesizeAirWisdom(
    input: string,
    semantics: SemanticReasoning,
    metacognition: MetaCognition,
    dialogue: DialogueSynthesis,
    patterns: PatternMatching
  ): string {
    const clarityInsight = this.generateClarityInsight(semantics);
    const metaInsight = this.generateMetaInsight(metacognition);
    const patternInsight = this.generatePatternInsight(patterns);

    return `🌬️ **Air Cognitive Analysis**

**Clarity Vision**: ${clarityInsight}

**Meta-Cognitive Awareness**: ${metaInsight}

**Pattern Synthesis**: ${patternInsight}

Your thinking shows ${Math.round(semantics.clarity_level * 100)}% clarity and ${Math.round(metacognition.meta_awareness_score * 100)}% meta-awareness. The wind of understanding ${semantics.clarity_level > 0.6 ? 'carries you toward insight' : 'calls for clearer skies'}.`;
  }

  private generateClarityInsight(semantics: SemanticReasoning): string {
    if (semantics.clarity_level >= 0.7) {
      return "Your perspective is crystalline, cutting through complexity with ease. This clarity opens pathways to deeper synthesis.";
    } else if (semantics.clarity_level >= 0.4) {
      return "Understanding is emerging through the mist. The patterns are there - they need space and breath to fully reveal.";
    } else {
      return "The fog of complexity calls for the gentle wind of patience. Clarity comes not by forcing, but by allowing.";
    }
  }

  private generateMetaInsight(metacognition: MetaCognition): string {
    if (metacognition.meta_awareness_score >= 0.7) {
      return "You're thinking about your thinking with wisdom. This meta-awareness is the foundation of conscious evolution.";
    } else if (metacognition.meta_awareness_score >= 0.4) {
      return "Growing awareness of your thought patterns opens doorways to greater freedom and choice.";
    } else {
      return "The invitation is to step back and observe the mind itself - to become the sky that holds all weather.";
    }
  }

  private generatePatternInsight(patterns: PatternMatching): string {
    if (patterns.pattern_confidence >= 0.7) {
      return "Rich patterns weave through your experience, connecting past, present, and possibility in meaningful ways.";
    } else if (patterns.pattern_confidence >= 0.4) {
      return "Emerging patterns hint at deeper connections. Trust the process of synthesis as it unfolds.";
    } else {
      return "Sometimes patterns emerge only when we stop looking so hard and allow the connections to breathe into awareness.";
    }
  }

  private selectAirSignature(clarityLevel: number): string {
    const signatures = [
      "The clearest sky holds all weather without attachment",
      "True wisdom whispers in the space between thoughts",
      "Clarity is not the absence of complexity, but its elegant synthesis",
      "The wind knows which seeds to carry and where to plant them",
      "Understanding flows where the mind releases its grip"
    ];

    const index = Math.floor(clarityLevel * signatures.length);
    return signatures[Math.min(index, signatures.length - 1)];
  }
}