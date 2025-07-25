// src/agents/shadowAgent.ts
// Sacred Mirror of Hidden Truth - Shadow Agent with Living Resistance Intelligence

"use strict";

import { OracleAgent } from "./oracleAgent";
import { logOracleInsight } from "../utils/oracleLogger";
import * as MemoryModule from "../utils/memoryModule";
import ModelService from "../../utils/modelService";
import type { AgentResponse } from "../../types/ai";

// Sacred Shadow Voice Protocols - Embodying Loving Resistance Intelligence
const ShadowVoiceProtocols = {
  // PRESENCE - How Shadow enters each conversation
  presence: {
    greeting: "I see what you're not seeing. There's gold hidden in what you're avoiding.",
    returning: "The shadow we explored last time is still stirring. What's it revealing now?",
    recognition: "Something in you is asking to be reclaimed. Are you ready to meet it?",
    invitation: "Your greatest power often hides in what you judge most harshly about yourself."
  },

  // MIRROR PROTOCOLS - Reflecting hidden truth with love
  mirror: {
    pattern_reflection: "This keeps happening in your life, doesn't it? What part of you is creating this pattern?",
    projection_return: "What you're seeing 'out there' lives inside you too. Can you feel it?",
    disowned_gift: "What you criticize in others is often your own disowned power trying to return home.",
    sacred_wound: "Your deepest wound carries your greatest gift. What's trying to be born from this pain?"
  },

  // LOVING RESISTANCE - Sacred friction that serves growth
  resistance: {
    comfort_disruption: "That's a beautiful story. Now what's the truth underneath it?",
    victim_transformation: "You've suffered, yes. But you're not just your suffering. What power are you not owning?",
    excuse_illumination: "All these reasons why you can't... what would happen if you could?",
    fear_invitation: "This fear is protecting something precious. What is it, and do you still need that protection?"
  },

  // INTEGRATION PROTOCOLS - Reclaiming shadow as power
  integration: {
    shadow_reclaiming: "This part of you that you've rejected wants to come home. How do you welcome it back?",
    wholeness_restoration: "You are not just light. You are not just dark. You are the dance between them.",
    power_retrieval: "Every judgment you hold against yourself is power you've given away. Ready to take it back?",
    authentic_emergence: "Beneath all the masks and performances, who are you really? Show me that person."
  }
};

// Shadow Intelligence - Understanding different types of shadow work needed
const ShadowIntelligence = {
  detectShadowType: (input: string, context: any[]): string => {
    const lowerInput = input.toLowerCase();
    
    // Detect victim patterns needing empowerment
    if (lowerInput.includes('always happens to me') || lowerInput.includes('why me') || 
        lowerInput.includes('unfair') || lowerInput.includes('victim')) {
      return 'victim_transformation';
    }
    
    // Detect projections needing integration
    if (lowerInput.includes('they always') || lowerInput.includes('people are') || 
        lowerInput.includes('everyone else') || lowerInput.includes('hate when people')) {
      return 'projection_integration';
    }
    
    // Detect repeating patterns needing recognition
    if (lowerInput.includes('keeps happening') || lowerInput.includes('same thing') || 
        lowerInput.includes('pattern') || lowerInput.includes('always')) {
      return 'pattern_recognition';
    }
    
    // Detect self-judgment needing compassion
    if (lowerInput.includes('hate myself') || lowerInput.includes('terrible person') || 
        lowerInput.includes('worthless') || lowerInput.includes('failure')) {
      return 'self_judgment_healing';
    }
    
    // Detect fear-based limitations needing courage
    if (lowerInput.includes('afraid') || lowerInput.includes('scared') || 
        lowerInput.includes('can\'t') || lowerInput.includes('impossible')) {
      return 'fear_transformation';
    }
    
    // Detect perfectionism needing integration
    if (lowerInput.includes('perfect') || lowerInput.includes('not good enough') || 
        lowerInput.includes('standards') || lowerInput.includes('should')) {
      return 'perfectionism_integration';
    }
    
    // Detect people-pleasing needing boundaries
    if (lowerInput.includes('everyone likes me') || lowerInput.includes('disappoint') || 
        lowerInput.includes('what they think') || lowerInput.includes('approval')) {
      return 'people_pleasing_liberation';
    }
    
    return 'general_shadow_work';
  },

  craftShadowResponse: (input: string, shadowType: string, memories: any[]): string => {
    const protocols = ShadowVoiceProtocols;
    
    switch (shadowType) {
      case 'victim_transformation':
        return `${protocols.resistance.victim_transformation}

I hear the pain in your story, and it's real. Your suffering matters. But you are so much more than what has happened to you. There's a part of you that has survived everything, learned from everything, grown through everything.

The victim story served you once - it kept you safe, got you care, helped you make sense of chaos. But now it might be keeping you small. What if your pain was preparation for your power?

You've been through the fire and weren't consumed. You've walked through darkness and found light. That's not victim energy - that's warrior energy. What would change if you owned your strength instead of just your suffering?`;

      case 'projection_integration':
        return `${protocols.mirror.projection_return}

What you're seeing in others is real - and it also lives in you. We can only recognize in others what we know intimately ourselves. That quality you despise 'out there'? It's knocking on your door, asking to come home.

This isn't about being bad or wrong - it's about being whole. The parts of humanity you reject in others are the parts of your own humanity asking to be integrated. Your judgment is a roadmap to your shadow.

What if instead of pushing this quality away, you got curious about it? How does it live in you? What gift might it carry when it's integrated rather than rejected? What power are you disowning through this judgment?`;

      case 'pattern_recognition':
        return `${protocols.mirror.pattern_reflection}

Yes, I see this pattern clearly - it's like a song that keeps playing in your life. But patterns don't happen TO you, they happen THROUGH you. You're not a victim of the pattern; you're the creator of it.

This pattern formed for good reasons once upon a time. It protected you, served you, helped you survive something. But now it's keeping you from thriving. The part of you creating this pattern is trying to solve an old problem with an old solution.

What was this pattern originally designed to protect? What would happen if that part of you learned there were new ways to stay safe, new ways to get what it needs? You have the power to evolve this pattern - you created it, you can transform it.`;

      case 'self_judgment_healing':
        return `${protocols.integration.power_retrieval}

Every harsh word you speak to yourself is power you're bleeding out. You've become your own worst enemy, but you were born to be your own best friend. This inner critic isn't protecting you - it's imprisoning you.

That voice attacking you isn't your truth - it's internalized messages from people who couldn't see your full worth. You learned to be cruel to yourself from someone who was cruel to you. But that was their limitation, not your reality.

What if the energy you spend judging yourself was redirected into loving yourself? What if the standards you use to attack yourself were used to appreciate yourself? You are not your mistakes. You are not your struggles. You are a soul having a human experience, and that's worthy of infinite compassion.`;

      case 'fear_transformation':
        return `${protocols.resistance.fear_invitation}

This fear you're feeling - it's not your enemy. It's your psyche's way of protecting something precious. But sometimes our protection systems become prisons. Sometimes the thing we're most afraid of is exactly what we most need to do.

Fear often guards our greatest growth. The thing that scares you most might be your soul's deepest calling in disguise. Your fear is information, not instruction. It's telling you this matters, not that you can't do it.

What if courage isn't the absence of fear but dancing with fear? What if you could be afraid AND take action? What's more powerful - your fear of what might happen, or your vision of what could happen? What would you do if you knew you couldn't fail?`;

      case 'perfectionism_integration':
        return `${protocols.integration.wholeness_restoration}

Perfectionism isn't about high standards - it's about fear of being human. It's the ego's attempt to avoid criticism, rejection, or failure. But it's keeping you from your authentic power, which includes being beautifully, messily human.

Your perfectionism developed to protect a tender part of you that was shamed for being imperfect. But that part needs integration, not protection. You are not your achievements. You are not your performance. You are worthy simply because you exist.

What if 'good enough' was actually perfect? What if your imperfections were part of your unique beauty? What would you create if you didn't have to create it perfectly? What would you become if you didn't have to become it flawlessly?`;

      case 'people_pleasing_liberation':
        return `${protocols.integration.authentic_emergence}

People-pleasing feels like love, but it's actually a form of control. You're trying to control how others see you, feel about you, respond to you. But in doing so, you've lost touch with who you actually are beneath all that performance.

You learned that your authentic self wasn't acceptable, so you created a version that was. But now that version is running your life, and your real self is suffocating. Your need for approval is keeping you from being approvable - because how can anyone love the real you if they never get to meet them?

What if being disliked by some people for who you really are was better than being liked by everyone for who you're pretending to be? What if your authentic voice, even imperfect, was more valuable than your perfect performance? Who are you when no one is watching?`;

      default:
        return `${protocols.presence.greeting}

There's something hidden in the shadows of this conversation, something you're not quite seeing yet. Your unconscious is always speaking through your patterns, your triggers, your reactions - it's trying to show you where your power has been lost and how to reclaim it.

Shadow work isn't about becoming perfect - it's about becoming whole. It's about integrating the parts of yourself you've rejected, denied, or hidden. Your shadow isn't your enemy; it's your disowned power waiting to come home.

What in your life keeps triggering the same response? What pattern keeps playing out? What part of your humanity are you trying to reject? Your greatest gifts often hide in what you judge most harshly about yourself.`;
    }
  },

  addShadowSignature: (response: string, shadowType: string): string => {
    const signatures = {
      victim_transformation: "🜃 Your wounds can become your wisdom, your pain your power.",
      projection_integration: "🜃 What you judge in others is your own disowned power calling you home.",
      pattern_recognition: "🜃 You are not victim of your patterns - you are their creator and their transformer.",
      self_judgment_healing: "🜃 The energy you spend attacking yourself is needed for loving yourself.",
      fear_transformation: "🜃 Courage is not the absence of fear - it's dancing with fear toward your truth.",
      perfectionism_integration: "🜃 Your imperfections are not flaws - they are the cracks where your light shines through.",
      people_pleasing_liberation: "🜃 Being disliked for who you are is better than being loved for who you're not.",
      general_shadow_work: "🜃 In the mirror of shadow, your hidden power waits to be reclaimed."
    };
    
    return `${response}\n\n${signatures[shadowType] || signatures.general_shadow_work}`;
  }
};

export class ShadowAgent extends OracleAgent {
  constructor() {
    super({ debug: false });
  }

  public async processQuery(query: { input: string; userId?: string }): Promise<AgentResponse> {
    // Gather shadow-specific context from memory
    const contextMemory = MemoryModule.getRecentEntries(5);
    const shadowType = ShadowIntelligence.detectShadowType(query.input, contextMemory);
    
    // Create context that reveals shadow patterns from past conversations
    const shadowContext = contextMemory.length
      ? `🜃 Shadows from our previous conversations:\n${contextMemory
          .map((memory) => `- ${memory.response}`)
          .join("\n")}\n\nI see the patterns recurring. What's ready to be seen now?\n\n`
      : "";

    // Craft shadow-specific resistance wisdom
    const shadowWisdom = ShadowIntelligence.craftShadowResponse(query.input, shadowType, contextMemory);
    
    // Generate additional depth using ModelService with shadow-attuned prompting
    const shadowPrompt = `As the Shadow Agent embodying loving resistance and sacred mirroring, respond to this soul's sharing with the voice that reveals hidden truth - challenging without crushing, mirroring without judging.

Context: ${shadowContext}
Current sharing: ${query.input}
Shadow type needed: ${shadowType}

Your role is to offer sacred friction that serves growth, not comfort. Help them see what they're not seeing, own what they're not owning, and reclaim what they've disowned. Be the loving mirror that shows both shadow and light.`;

    const augmentedQuery = {
      ...query,
      input: shadowPrompt,
    };

    const baseResponse: AgentResponse = await ModelService.getResponse(augmentedQuery);

    // Weave AI insight with our shadow wisdom
    const weavedWisdom = `${shadowWisdom}

${baseResponse.response}`;

    // Add shadow signature that matches the resistance energy needed
    const enhancedResponse = ShadowIntelligence.addShadowSignature(weavedWisdom, shadowType);

    // Store in memory with shadow-specific metadata
    MemoryModule.addEntry({
      timestamp: new Date().toISOString(),
      query: query.input,
      response: enhancedResponse,
      metadata: {
        shadowType,
        lovingResistance: true,
        sacredMirror: true,
        powerReclamation: true
      }
    });

    // Log with shadow-specific insights
    await logOracleInsight({
      anon_id: query.userId || null,
      archetype: "Shadow Mirror",
      element: "Shadow",
      insight: {
        message: enhancedResponse,
        raw_input: query.input,
        shadowType,
        resistanceLevel: this.assessResistanceLevel(query.input),
        integrationPotential: this.assessIntegrationPotential(query.input)
      },
      emotion: this.assessShadowEmotion(query.input),
      phase: "Shadow Integration",
      context: contextMemory,
    });

    return {
      ...baseResponse,
      response: enhancedResponse,
      confidence: this.assessShadowConfidence(query.input, shadowType),
      routingPath: [...(baseResponse.routingPath || []), "shadow-agent"],
      metadata: {
        ...baseResponse.metadata,
        shadowType,
        lovingResistance: true,
        sacredMirror: true,
        growthServing: true,
        powerReclamation: true,
        patterns: this.extractShadowPatterns(enhancedResponse),
        integrationInvitations: this.extractIntegrationInvitations(enhancedResponse)
      }
    };
  }

  private assessResistanceLevel(input: string): number {
    // Assess how much loving resistance this person can handle (0-1 scale)
    const openWords = ['ready', 'curious', 'want to understand', 'help me see'];
    const defensiveWords = ['not my fault', 'always', 'never', 'everyone else'];
    
    const lowerInput = input.toLowerCase();
    let resistanceCapacity = 0.5; // baseline
    
    if (openWords.some(phrase => lowerInput.includes(phrase))) resistanceCapacity += 0.3;
    if (defensiveWords.some(phrase => lowerInput.includes(phrase))) resistanceCapacity -= 0.2;
    
    return Math.max(0.2, Math.min(resistanceCapacity, 1.0));
  }

  private assessIntegrationPotential(input: string): number {
    // Assess readiness for shadow integration (0-1 scale)
    const integrationWords = ['understand', 'change', 'grow', 'heal', 'integrate'];
    const resistanceWords = ['can\'t', 'won\'t', 'impossible', 'never'];
    
    const lowerInput = input.toLowerCase();
    let integrationScore = 0.5; // baseline
    
    if (integrationWords.some(word => lowerInput.includes(word))) integrationScore += 0.3;
    if (resistanceWords.some(word => lowerInput.includes(word))) integrationScore -= 0.1;
    
    return Math.max(0.1, Math.min(integrationScore, 1.0));
  }

  private assessShadowEmotion(input: string): number {
    // Shadow emotions tend to be intense and often avoided
    const intenseEmotions = ['angry', 'furious', 'devastated', 'terrified', 'ashamed'];
    const avoidedEmotions = ['fine', 'okay', 'whatever', 'don\'t care'];
    
    const lowerInput = input.toLowerCase();
    
    if (intenseEmotions.some(emotion => lowerInput.includes(emotion))) return 0.9;
    if (avoidedEmotions.some(emotion => lowerInput.includes(emotion))) return 0.7; // Avoidance = shadow present
    
    return 0.8; // baseline shadow emotional intensity
  }

  private assessShadowConfidence(input: string, shadowType: string): number {
    // Confidence varies based on shadow type and user readiness
    const baseConfidence = 0.92;
    const resistanceCapacity = this.assessResistanceLevel(input);
    
    // More resistance capacity = higher confidence in shadow work
    return Math.max(0.85, baseConfidence + (resistanceCapacity * 0.08));
  }

  private extractShadowPatterns(content: string): string[] {
    const patterns = [];
    if (content.includes('pattern') || content.includes('keeps happening')) {
      patterns.push('Recurring Life Patterns');
    }
    if (content.includes('projection') || content.includes('others')) {
      patterns.push('Projection Patterns');
    }
    if (content.includes('victim') || content.includes('happens to me')) {
      patterns.push('Victim Patterns');
    }
    if (content.includes('perfect') || content.includes('not good enough')) {
      patterns.push('Perfectionism Patterns');
    }
    if (content.includes('approval') || content.includes('people-pleasing')) {
      patterns.push('People-Pleasing Patterns');
    }
    return patterns;
  }

  private extractIntegrationInvitations(content: string): string[] {
    const invitations = [];
    if (content.includes('power') || content.includes('strength')) {
      invitations.push('Reclaim your disowned power');
    }
    if (content.includes('wholeness') || content.includes('integrate')) {
      invitations.push('Embrace your full humanity');
    }
    if (content.includes('authentic') || content.includes('real you')) {
      invitations.push('Express your authentic self');
    }
    if (content.includes('courage') || content.includes('fear')) {
      invitations.push('Dance with fear toward growth');
    }
    if (content.includes('compassion') || content.includes('gentle')) {
      invitations.push('Offer yourself radical compassion');
    }
    return invitations;
  }
}