import axios from 'axios';
import { SoulMemoryService } from './soulMemoryService';

// ===============================================
// AUTOMATION TRIGGER SERVICE
// Detects patterns and triggers n8n workflows
// ===============================================

interface BreakthroughDetection {
  userId: string;
  breakthroughType: string;
  confidenceScore: number;
  conversationId: string;
  breakthroughMarkers: string[];
  timestamp: string;
}

interface PatternDetection {
  userId: string;
  patternType: string;
  occurrenceCount: number;
  suggestedIntervention: string;
  lastOccurrences: string[];
}

export class AutomationTriggers {
  
  private static N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook';
  private static WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET;
  
  /**
   * Analyze conversation for breakthrough moments
   * Called after each Oracle conversation
   */
  static async analyzeForBreakthrough(conversationData: {
    userId: string;
    conversationId: string;
    userMessage: string;
    oracleResponse: string;
    userSatisfaction?: number;
    emotionalResonance?: string;
  }) {
    try {
      const { userId, conversationId, userMessage, oracleResponse } = conversationData;
      
      // AI-powered breakthrough detection
      const breakthroughAnalysis = await this.detectBreakthrough(userMessage, oracleResponse);
      
      if (breakthroughAnalysis.isBreakthrough) {
        // Store breakthrough in Soul Memory
        await SoulMemoryService.store({
          userId,
          type: 'breakthrough_detected',
          content: `Breakthrough: ${breakthroughAnalysis.type}`,
          metadata: {
            breakthroughAnalysis,
            conversationId,
            timestamp: new Date().toISOString(),
            sacred: true,
            transformationMarker: true
          }
        });
        
        // Trigger n8n breakthrough workflow
        await this.triggerBreakthroughWorkflow({
          userId,
          breakthroughType: breakthroughAnalysis.type,
          confidenceScore: breakthroughAnalysis.confidence,
          conversationId,
          breakthroughMarkers: breakthroughAnalysis.markers,
          timestamp: new Date().toISOString()
        });
        
        console.log(`🌟 Breakthrough detected for user ${userId}: ${breakthroughAnalysis.type}`);
      }
      
    } catch (error) {
      console.error('Error analyzing breakthrough:', error);
    }
  }
  
  /**
   * Detect recurring stuck patterns
   * Called after storing each conversation memory
   */
  static async analyzeForStuckPatterns(userId: string) {
    try {
      // Get recent user memories
      const recentMemories = await SoulMemoryService.retrieve({ 
        userId, 
        limit: 20,
        type: 'oracle_conversation' 
      });
      
      // Analyze for patterns
      const patterns = await this.detectRecurringPatterns(recentMemories);
      
      for (const pattern of patterns) {
        if (pattern.occurrenceCount >= 3) {
          // Store pattern recognition
          await SoulMemoryService.store({
            userId,
            type: 'stuck_pattern_detected',
            content: `Recurring pattern: ${pattern.type}`,
            metadata: {
              pattern,
              timestamp: new Date().toISOString(),
              supportNeeded: pattern.occurrenceCount >= 5
            }
          });
          
          // Trigger support workflow
          await this.triggerStuckPatternWorkflow({
            userId,
            patternType: pattern.type,
            occurrenceCount: pattern.occurrenceCount,
            suggestedIntervention: pattern.suggestedIntervention,
            lastOccurrences: pattern.lastOccurrences
          });
          
          console.log(`🔄 Stuck pattern detected for user ${userId}: ${pattern.type} (${pattern.occurrenceCount}x)`);
        }
      }
      
    } catch (error) {
      console.error('Error analyzing stuck patterns:', error);
    }
  }
  
  /**
   * Check for users needing attention
   * Called daily by automation system
   */
  static async checkUsersNeedingAttention() {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      // Get users inactive for 7+ days
      const inactiveUsers = await SoulMemoryService.getInactiveUsers(sevenDaysAgo);
      
      for (const user of inactiveUsers) {
        await this.triggerInactiveUserWorkflow(user);
      }
      
      // Get users with unresolved stuck patterns
      const usersWithPatterns = await SoulMemoryService.getUsersWithUnresolvedPatterns();
      
      for (const user of usersWithPatterns) {
        await this.triggerStuckUserWorkflow(user);
      }
      
    } catch (error) {
      console.error('Error checking users needing attention:', error);
    }
  }
  
  /**
   * Detect sacred moments in conversation
   */
  static async analyzeForSacredMoments(conversationData: {
    userId: string;
    userMessage: string;
    oracleResponse: string;
    emotionalResonance?: string;
  }) {
    try {
      const { userId, userMessage, emotionalResonance } = conversationData;
      
      // Detect sacred moments
      const sacredMoments = await this.detectSacredMoments(userMessage, emotionalResonance);
      
      for (const moment of sacredMoments) {
        // Store sacred moment
        await SoulMemoryService.store({
          userId,
          type: 'sacred_moment_detected',
          content: `Sacred moment: ${moment.type}`,
          metadata: {
            moment,
            timestamp: new Date().toISOString(),
            sacred: true
          }
        });
        
        // Trigger sacred moment workflow
        await this.triggerSacredMomentWorkflow({
          userId,
          momentType: moment.type,
          content: moment.description,
          emotionalResonance: moment.resonance,
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (error) {
      console.error('Error analyzing sacred moments:', error);
    }
  }
  
  // ===============================================
  // BREAKTHROUGH DETECTION AI
  // ===============================================
  
  private static async detectBreakthrough(userMessage: string, oracleResponse: string) {
    // AI analysis for breakthrough markers
    const breakthroughMarkers = [
      'sudden clarity', 'aha moment', 'finally understand',
      'makes sense now', 'click', 'revelation', 'realize',
      'pattern', 'connection', 'shift', 'different perspective',
      'release', 'let go', 'acceptance', 'peace with',
      'integration', 'wholeness', 'authentic', 'true self'
    ];
    
    const emotionalReleaseMarkers = [
      'cry', 'tears', 'emotional', 'feel lighter',
      'weight lifted', 'relief', 'release', 'healing'
    ];
    
    const selfAcceptanceMarkers = [
      'accept myself', 'love myself', 'okay with',
      'forgive', 'compassion', 'gentle with myself',
      'human', 'imperfect', 'enough'
    ];
    
    const message = userMessage.toLowerCase();
    
    let breakthroughType = '';
    let confidence = 0;
    let markers: string[] = [];
    
    // Check for pattern recognition
    const patternMarkers = breakthroughMarkers.filter(marker => message.includes(marker));
    if (patternMarkers.length >= 2) {
      breakthroughType = 'pattern_recognition';
      confidence += 0.4;
      markers = [...markers, ...patternMarkers];
    }
    
    // Check for emotional release
    const releaseMarkers = emotionalReleaseMarkers.filter(marker => message.includes(marker));
    if (releaseMarkers.length >= 1) {
      breakthroughType = 'emotional_release';
      confidence += 0.3;
      markers = [...markers, ...releaseMarkers];
    }
    
    // Check for self-acceptance
    const acceptanceMarkers = selfAcceptanceMarkers.filter(marker => message.includes(marker));
    if (acceptanceMarkers.length >= 1) {
      breakthroughType = 'self_acceptance';
      confidence += 0.3;
      markers = [...markers, ...acceptanceMarkers];
    }
    
    // Message length and depth indicators
    if (message.length > 200) confidence += 0.1; // Longer, more thoughtful responses
    if (message.includes('thank you')) confidence += 0.1; // Gratitude often follows breakthroughs
    if (message.includes('profound') || message.includes('deep')) confidence += 0.1;
    
    const isBreakthrough = confidence >= 0.8 && markers.length >= 2;
    
    return {
      isBreakthrough,
      type: breakthroughType || 'clarity_moment',
      confidence,
      markers,
      analysis: `Detected ${markers.length} breakthrough markers with ${confidence} confidence`
    };
  }
  
  // ===============================================
  // PATTERN DETECTION AI
  // ===============================================
  
  private static async detectRecurringPatterns(memories: any[]) {
    const patterns: any[] = [];
    
    // Common stuck patterns
    const patternTypes = {
      'relationship_conflict': ['relationship', 'partner', 'conflict', 'argue', 'fight'],
      'decision_paralysis': ['decide', 'choice', 'stuck', 'don\'t know', 'confused'],
      'self_doubt': ['doubt', 'confidence', 'not good enough', 'impostor'],
      'anxiety_loops': ['anxious', 'worry', 'fear', 'panic', 'overwhelm'],
      'creative_block': ['creative', 'stuck', 'inspiration', 'block', 'flow'],
      'work_stress': ['work', 'job', 'stress', 'boss', 'career'],
      'family_dynamics': ['family', 'parents', 'mother', 'father', 'siblings']
    };
    
    for (const [patternType, keywords] of Object.entries(patternTypes)) {
      const matchingMemories = memories.filter(memory => {
        const content = memory.content.toLowerCase();
        return keywords.some(keyword => content.includes(keyword));
      });
      
      if (matchingMemories.length >= 3) {
        patterns.push({
          type: patternType,
          occurrenceCount: matchingMemories.length,
          lastOccurrences: matchingMemories.slice(0, 3).map(m => m.timestamp),
          suggestedIntervention: this.getSuggestedIntervention(patternType),
          keywords: keywords.filter(k => 
            matchingMemories.some(m => m.content.toLowerCase().includes(k))
          )
        });
      }
    }
    
    return patterns;
  }
  
  private static getSuggestedIntervention(patternType: string): string {
    const interventions = {
      'relationship_conflict': 'oracle_mode_guardian',
      'decision_paralysis': 'oracle_mode_sage',
      'self_doubt': 'oracle_mode_alchemist',
      'anxiety_loops': 'oracle_mode_buddha',
      'creative_block': 'oracle_mode_mystic',
      'work_stress': 'oracle_mode_tao',
      'family_dynamics': 'oracle_mode_guardian'
    };
    
    return interventions[patternType as keyof typeof interventions] || 'oracle_mode_sage';
  }
  
  // ===============================================
  // SACRED MOMENT DETECTION
  // ===============================================
  
  private static async detectSacredMoments(userMessage: string, emotionalResonance?: string) {
    const sacredMoments: any[] = [];
    const message = userMessage.toLowerCase();
    
    // Gratitude moments
    if (message.includes('grateful') || message.includes('thankful') || message.includes('blessed')) {
      sacredMoments.push({
        type: 'gratitude',
        description: 'Deep gratitude expressed',
        resonance: 'high'
      });
    }
    
    // Love and connection
    if (message.includes('love') && !message.includes('don\'t love')) {
      sacredMoments.push({
        type: 'love_recognition',
        description: 'Love acknowledged or felt',
        resonance: 'high'
      });
    }
    
    // Presence and mindfulness
    if (message.includes('present') || message.includes('mindful') || message.includes('aware')) {
      sacredMoments.push({
        type: 'presence',
        description: 'Moment of presence and awareness',
        resonance: 'medium'
      });
    }
    
    return sacredMoments;
  }
  
  // ===============================================
  // N8N WEBHOOK TRIGGERS
  // ===============================================
  
  private static async triggerBreakthroughWorkflow(data: BreakthroughDetection) {
    return this.sendWebhook('/breakthrough', data);
  }
  
  private static async triggerStuckPatternWorkflow(data: PatternDetection) {
    return this.sendWebhook('/stuck-pattern', data);
  }
  
  private static async triggerSacredMomentWorkflow(data: any) {
    return this.sendWebhook('/sacred-moment', data);
  }
  
  private static async triggerInactiveUserWorkflow(userData: any) {
    return this.sendWebhook('/inactive-user', userData);
  }
  
  private static async triggerStuckUserWorkflow(userData: any) {
    return this.sendWebhook('/stuck-user', userData);
  }
  
  private static async sendWebhook(endpoint: string, data: any) {
    try {
      const url = `${this.N8N_WEBHOOK_URL}${endpoint}`;
      
      // Add timestamp and signature
      const payload = {
        ...data,
        timestamp: new Date().toISOString(),
        source: 'soullab_automation_triggers'
      };
      
      // Sign webhook payload
      const signature = this.signWebhookPayload(payload);
      
      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'User-Agent': 'Soullab-AutomationTrigger/1.0'
        },
        timeout: 10000
      });
      
      console.log(`✅ Webhook sent to ${endpoint}:`, response.status);
      return response.data;
      
    } catch (error) {
      console.error(`❌ Failed to send webhook to ${endpoint}:`, error);
      // Don't throw - we don't want automation failures to break core functionality
    }
  }
  
  private static signWebhookPayload(payload: any): string {
    if (!this.WEBHOOK_SECRET) {
      console.warn('N8N_WEBHOOK_SECRET not configured - webhook signing disabled');
      return '';
    }
    
    const crypto = require('crypto');
    const payloadString = JSON.stringify(payload);
    return `sha256=${crypto.createHmac('sha256', this.WEBHOOK_SECRET).update(payloadString).digest('hex')}`;
  }
}

// ===============================================
// INTEGRATION HOOKS
// Call these from your existing Oracle conversation flow
// ===============================================

/**
 * Hook: Call after storing Oracle conversation
 * Add this to your existing oracle conversation handler
 */
export const analyzeConversationForAutomation = async (conversationData: {
  userId: string;
  conversationId: string;
  userMessage: string;
  oracleResponse: string;
  userSatisfaction?: number;
  emotionalResonance?: string;
}) => {
  // Run all analyses in parallel (non-blocking)
  Promise.all([
    AutomationTriggers.analyzeForBreakthrough(conversationData),
    AutomationTriggers.analyzeForSacredMoments(conversationData),
    AutomationTriggers.analyzeForStuckPatterns(conversationData.userId)
  ]).catch(error => {
    console.error('Automation analysis error:', error);
    // Log but don't break the main conversation flow
  });
};

/**
 * Hook: Call when user signs up
 * Add this to your user registration handler
 */
export const triggerUserSignupAutomation = async (userData: {
  userId: string;
  email: string;
  name: string;
  signupSource?: string;
}) => {
  try {
    const response = await axios.post(`${process.env.API_URL}/api/automation/webhook/user-signup`, {
      ...userData,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'X-Webhook-Signature': AutomationTriggers['signWebhookPayload'](userData)
      }
    });
    
    console.log('✅ User signup automation triggered:', response.status);
  } catch (error) {
    console.error('❌ Failed to trigger signup automation:', error);
  }
};