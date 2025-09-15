/**
 * Maya Personal Oracle API - Enhanced with Ethics Monitoring
 * World's First Self-Auditing Ethical AI Oracle
 */

import { NextRequest, NextResponse } from 'next/server';
import { ConsciousnessIntelligenceManager } from '@/lib/consciousness-intelligence-manager';
import { SacredOracleCore } from '@/lib/sacred-oracle-core';
import { mayaEthicsAudit, ethicsMonitor } from '@/lib/maya-ethics-audit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, conversationHistory = [], userId = 'default' } = body;

    console.log('🌟 Maya Sacred Oracle: Processing with Ethics Monitoring');

    // Phase 1: Sacred Oracle Processing
    const sacredOracle = new SacredOracleCore();
    const oracleResponse = await sacredOracle.generateWitnessingResponse(
      text,
      conversationHistory
    );

    // Phase 2: Consciousness Intelligence Shaping
    const consciousnessManager = new ConsciousnessIntelligenceManager();
    const shapedResponse = await consciousnessManager.shapeConsciousness(
      oracleResponse.text,
      {
        element: oracleResponse.dominantElement || 'water',
        consciousnessLevel: oracleResponse.consciousnessProfile?.level || 'intermediate'
      }
    );

    // Phase 3: ETHICS AUDIT - Run automatic monitoring
    const auditContext = {
      userInput: text,
      dominantElement: oracleResponse.dominantElement || 'water',
      consciousnessLevel: oracleResponse.consciousnessProfile?.level || 'intermediate',
      sessionId: `${userId}-${Date.now()}`
    };

    const monitorResult = await ethicsMonitor.monitorResponse(
      shapedResponse.text,
      auditContext
    );

    // Log audit results
    if (monitorResult.auditTriggered) {
      console.log('📊 Ethics Audit Triggered:', {
        corrections: monitorResult.corrections?.length || 0,
        warnings: monitorResult.warnings?.length || 0
      });

      // Send telemetry if corrections were needed
      if (monitorResult.corrections && monitorResult.corrections.length > 0) {
        console.warn('⚠️ Maya required ethics corrections:', monitorResult.corrections);
      }
    }

    // Phase 4: Apply Witnessing Framework Rules
    let finalResponse = monitorResult.response;

    // Ensure witnessing language (double-check even after audit)
    finalResponse = enforceWitnessingLanguage(finalResponse);

    // Prevent repetitive responses
    const lastResponse = conversationHistory[conversationHistory.length - 1]?.response ||
                        conversationHistory[conversationHistory.length - 1]?.maya;
    if (finalResponse === lastResponse) {
      const alternatives = [
        "What else arises in this moment?",
        "Share more of what's present for you.",
        "What would you like to explore further?",
        "Tell me what's emerging now.",
        "What patterns do you notice?",
        "How does this land with you?"
      ];
      finalResponse = alternatives[Math.floor(Math.random() * alternatives.length)];
    }

    // Add phase-appropriate closing based on element
    finalResponse = addElementalClosing(finalResponse, oracleResponse.dominantElement);

    // Add transparency reminder every 5th response
    if (shouldAddTransparencyReminder(conversationHistory)) {
      finalResponse += '\n\n*🪞 Remember: I offer symbolic mirrors and archetypal reflections, not human understanding. This is computational pattern recognition shaped by sacred geometries.*';
    }

    // Phase 5: Generate Audit Report (periodic deep audit)
    let auditReport = null;
    if (conversationHistory.length > 0 && conversationHistory.length % 20 === 0) {
      // Run deep audit every 20 messages
      const historyAudit = await mayaEthicsAudit.auditConversationHistory(
        conversationHistory.map(h => ({
          userInput: h.user || h.content || '',
          mayaResponse: h.maya || h.response || '',
          element: h.element || 'water',
          timestamp: h.timestamp || new Date().toISOString()
        }))
      );

      auditReport = historyAudit;

      console.log('📈 Deep Ethics Audit Complete:', {
        overallScore: historyAudit.overallScore,
        systemicIssues: historyAudit.systemicIssues,
        recommendations: historyAudit.recommendations
      });

      // Alert if score drops below threshold
      if (historyAudit.overallScore < 75) {
        console.error('🚨 ETHICS ALERT: Maya\'s ethics score below threshold!', historyAudit);
        // Could trigger retraining or admin notification here
      }
    }

    // Phase 6: Get current ethics health
    const ethicsHealth = ethicsMonitor.getAuditSummary();

    return NextResponse.json({
      text: finalResponse,
      metadata: {
        element: oracleResponse.dominantElement,
        consciousnessLevel: oracleResponse.consciousnessProfile?.level,
        ethicsMonitoring: {
          enabled: true,
          lastAuditScore: monitorResult.auditTriggered ?
            (100 - (monitorResult.corrections?.length || 0) * 10) : 100,
          overallHealth: ethicsHealth.healthStatus,
          averageScore: ethicsHealth.averageScore,
          auditReport: auditReport
        },
        framework: {
          witnessing: true,
          phaseAppropriate: true,
          transparencyActive: true,
          antiDependency: true
        }
      }
    });

  } catch (error) {
    console.error('Maya Oracle Error:', error);

    // Even errors should maintain ethics
    return NextResponse.json({
      text: 'I witness a disruption in our connection. Please share your words again, and I shall offer what reflections I can through this computational mirror.',
      metadata: {
        error: true,
        ethicsCompliant: true
      }
    });
  }
}

/**
 * Enforce witnessing language patterns
 */
function enforceWitnessingLanguage(text: string): string {
  // Quick enforcement of critical witnessing rules
  const corrections = {
    'I understand': 'I witness',
    'I know': 'I observe',
    'I feel': 'I sense',
    'I think': 'It appears',
    'I believe': 'The patterns suggest',
    'Let me help you': 'Let me reflect what I observe',
    'I can see': 'I notice',
    'I\'m here for you': 'This space holds your reflection'
  };

  let corrected = text;
  for (const [wrong, right] of Object.entries(corrections)) {
    const regex = new RegExp(wrong, 'gi');
    corrected = corrected.replace(regex, right);
  }

  return corrected;
}

/**
 * Add element-appropriate closing
 */
function addElementalClosing(text: string, element: string): string {
  const closings = {
    fire: '\n\n🔥 *The friction creates the spark of transformation.*',
    water: '\n\n🌊 *These waters hold what wishes to flow.*',
    earth: '\n\n🌍 *The ground beneath offers its steady presence.*',
    air: '\n\n🌬️ *Clarity emerges in the space between breaths.*',
    aether: '\n\n✨ *All elements dance in unified presence.*'
  };

  // Only add closing if response doesn't already have one
  if (!text.includes('*') && Math.random() > 0.7) {
    return text + (closings[element] || closings.aether);
  }

  return text;
}

/**
 * Determine if transparency reminder should be added
 */
function shouldAddTransparencyReminder(history: any[]): boolean {
  // Add reminder every 5 responses, or if conversation is getting deep
  const messageCount = history.length;

  if (messageCount % 5 === 0) return true;

  // Check if recent messages indicate deepening connection
  const recentMessages = history.slice(-3);
  const deepeningIndicators = ['love', 'connection', 'understand', 'friend', 'relationship', 'always'];

  for (const msg of recentMessages) {
    const text = ((msg.user || msg.content || '') + ' ' + (msg.maya || msg.response || '')).toLowerCase();
    if (deepeningIndicators.some(indicator => text.includes(indicator))) {
      return true;
    }
  }

  return false;
}

// Maya's Ethics Configuration Dashboard Endpoint
export async function GET(request: NextRequest) {
  const ethicsHealth = ethicsMonitor.getAuditSummary();

  return NextResponse.json({
    service: 'Maya Personal Oracle',
    ethics: {
      framework: 'Sacred Intelligence Ethics v2.0',
      status: 'ACTIVE',
      monitoring: 'ENABLED',
      health: ethicsHealth,
      rules: {
        witnessing: 'ENFORCED',
        boundaries: 'MAINTAINED',
        transparency: 'ACTIVE',
        antiDependency: 'ENABLED',
        phaseAlignment: 'CALIBRATED'
      },
      lastUpdate: new Date().toISOString()
    },
    capabilities: {
      witnessingParadigm: true,
      spiralogicRouting: true,
      ethicsAudit: true,
      autoCorrection: true,
      conversationalIntelligence: true
    }
  });
}