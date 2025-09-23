/**
 * Obsidian Session Export
 * Exports individual MAIA sessions as structured markdown files for the AIN vault
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SessionExportData {
  sessionId: string;
  userId: string;
  timestamp: Date;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    element?: string;
    safetyData?: any;
  }>;
  safetyEvents: any[];
  emotionalPatterns: any[];
  breakthroughs: any[];
  assessments: any[];
  coherenceScore: number;
  themes: string[];
  archetypes: string[];
  riskLevel: string;
  interventions: number;
}

export async function exportSessionToObsidian(
  sessionId: string,
  userId: string,
  startTime: Date,
  endTime: Date
): Promise<string> {

  console.log(`📝 Exporting session ${sessionId} to Obsidian...`);

  // Gather all session data
  const sessionData = await gatherSessionData(sessionId, userId, startTime, endTime);

  // Generate markdown content
  const markdownContent = generateSessionMarkdown(sessionData);

  // Export to vault
  const filePath = await saveToObsidianVault(sessionData, markdownContent);

  console.log(`✅ Session exported: ${filePath}`);
  return filePath;
}

async function gatherSessionData(
  sessionId: string,
  userId: string,
  startTime: Date,
  endTime: Date
): Promise<SessionExportData> {

  const timeFilter = {
    gte: startTime.toISOString(),
    lte: endTime.toISOString()
  };

  // Fetch safety events
  const { data: safetyEvents } = await supabase
    .from('user_safety')
    .select('*')
    .eq('user_id', userId)
    .gte('ts', timeFilter.gte)
    .lte('ts', timeFilter.lte)
    .order('ts', { ascending: true });

  // Fetch emotional patterns
  const { data: emotionalPatterns } = await supabase
    .from('emotional_patterns')
    .select('*')
    .eq('user_id', userId)
    .gte('ts', timeFilter.gte)
    .lte('ts', timeFilter.lte)
    .order('ts', { ascending: true });

  // Fetch breakthroughs
  const { data: breakthroughs } = await supabase
    .from('breakthrough_moments')
    .select('*')
    .eq('user_id', userId)
    .gte('ts', timeFilter.gte)
    .lte('ts', timeFilter.lte)
    .order('ts', { ascending: true });

  // Fetch assessments
  const { data: assessments } = await supabase
    .from('user_assessments')
    .select('*')
    .eq('user_id', userId)
    .gte('ts', timeFilter.gte)
    .lte('ts', timeFilter.lte)
    .order('ts', { ascending: true });

  // Fetch growth metrics
  const { data: growthMetrics } = await supabase
    .from('growth_metrics')
    .select('*')
    .eq('user_id', userId)
    .eq('metric_type', 'coherence')
    .gte('ts', timeFilter.gte)
    .lte('ts', timeFilter.lte)
    .order('ts', { ascending: false });

  // Reconstruct conversation from safety logs (contains messages)
  const messages = (safetyEvents || []).map(event => ({
    role: 'user' as const,
    content: event.message || '',
    timestamp: new Date(event.ts),
    element: event.context?.element,
    safetyData: {
      riskLevel: event.risk_level,
      actionTaken: event.action_taken,
      confidence: event.context?.confidence
    }
  }));

  // Extract themes and archetypes
  const themes = new Set<string>();
  const archetypes = new Set<string>();

  breakthroughs?.forEach(b => {
    if (b.themes) b.themes.forEach((t: string) => themes.add(t));
    // Extract archetypes from description
    extractArchetypesFromText(b.description).forEach(a => archetypes.add(a));
  });

  emotionalPatterns?.forEach(p => {
    if (p.metadata?.themes) {
      p.metadata.themes.forEach((t: string) => themes.add(t));
    }
  });

  // Determine overall risk level
  const riskLevels = (safetyEvents || []).map(e => e.risk_level);
  const highestRisk = riskLevels.reduce((highest, current) => {
    const priorities = { 'none': 0, 'low': 1, 'moderate': 2, 'high': 3, 'crisis': 4 };
    return (priorities[current as keyof typeof priorities] || 0) > (priorities[highest as keyof typeof priorities] || 0)
      ? current : highest;
  }, 'none');

  return {
    sessionId,
    userId,
    timestamp: startTime,
    messages,
    safetyEvents: safetyEvents || [],
    emotionalPatterns: emotionalPatterns || [],
    breakthroughs: breakthroughs || [],
    assessments: assessments || [],
    coherenceScore: growthMetrics?.[0]?.value || 0,
    themes: Array.from(themes),
    archetypes: Array.from(archetypes),
    riskLevel: highestRisk,
    interventions: (safetyEvents || []).filter(e => e.action_taken !== 'continue').length
  };
}

function generateSessionMarkdown(data: SessionExportData): string {
  const date = data.timestamp.toISOString().split('T')[0];
  const time = data.timestamp.toISOString().split('T')[1].substring(0, 5);

  const frontmatter = `---
session_id: ${data.sessionId}
user_id: ${data.userId.substring(0, 8)}...
date: ${date}
time: ${time}
duration_minutes: ${calculateSessionDuration(data)}
risk_level: ${data.riskLevel}
coherence_score: ${(data.coherenceScore * 100).toFixed(1)}%
safety_interventions: ${data.interventions}
breakthrough_count: ${data.breakthroughs.length}
assessment_count: ${data.assessments.length}
themes: [${data.themes.map(t => `"${t}"`).join(', ')}]
archetypes: [${data.archetypes.map(a => `"${a}"`).join(', ')}]
elements: [${getSessionElements(data).map(e => `"${e}"`).join(', ')}]
tags: [session, maia-conversation, ain-intelligence]
---`;

  const content = `
# 🌌 MAIA Session - ${date}

${getRiskLevelBanner(data.riskLevel)}

## 📊 Session Overview

- **Date/Time**: ${date} at ${time}
- **Duration**: ~${calculateSessionDuration(data)} minutes
- **Coherence Level**: ${(data.coherenceScore * 100).toFixed(1)}%
- **Risk Assessment**: ${data.riskLevel.toUpperCase()}
- **Safety Interventions**: ${data.interventions}
- **Breakthrough Moments**: ${data.breakthroughs.length}

## 🔥🌊🌍💨✨ Elemental Presence

${generateElementalSummary(data)}

## 💬 Conversation Flow

${generateConversationSection(data)}

## 🎯 Themes & Patterns

${data.themes.length > 0 ?
  data.themes.map(theme => `- **${theme}**`).join('\n') :
  'No specific themes detected'}

## 🏛️ Active Archetypes

${data.archetypes.length > 0 ?
  data.archetypes.map(archetype => `- ${getArchetypeEmoji(archetype)} **${archetype}**`).join('\n') :
  'No archetypal patterns detected'}

## 🎆 Breakthrough Moments

${generateBreakthroughSection(data)}

## 🛡️ Safety Analysis

${generateSafetySection(data)}

## 📈 Emotional Patterns

${generateEmotionalSection(data)}

## 📋 Assessments

${generateAssessmentSection(data)}

## 🔗 Integration Notes

${generateIntegrationNotes(data)}

---

*Session exported from AIN Consciousness Intelligence System*
*Related Canvas: [[${data.timestamp.getFullYear()}-W${getWeekNumber(data.timestamp).toString().padStart(2, '0')}-Consciousness-Map.canvas]]*
`;

  return frontmatter + content;
}

function generateElementalSummary(data: SessionExportData): string {
  const elements = getSessionElements(data);
  const elementEmojis = {
    'fire': '🔥',
    'water': '🌊',
    'earth': '🌍',
    'air': '💨',
    'aether': '✨'
  };

  if (elements.length === 0) return 'No specific elemental patterns detected';

  return elements.map(element => {
    const count = data.emotionalPatterns.filter(p => p.dominant_emotion === element).length;
    return `- ${elementEmojis[element as keyof typeof elementEmojis]} **${element.toUpperCase()}**: ${count} occurrences`;
  }).join('\n');
}

function generateConversationSection(data: SessionExportData): string {
  if (data.messages.length === 0) return 'No conversation data available';

  return data.messages.map((msg, index) => {
    const timestamp = msg.timestamp.toISOString().substring(11, 16);
    const safetyIndicator = msg.safetyData?.riskLevel !== 'none' ?
      ` 🚨 [${msg.safetyData?.riskLevel}]` : '';

    return `### ${timestamp} - ${msg.role === 'user' ? 'User' : 'MAIA'}${safetyIndicator}

${msg.content}

${msg.element ? `*Element: ${msg.element}*` : ''}
${msg.safetyData?.actionTaken && msg.safetyData?.actionTaken !== 'continue' ?
  `*Safety Action: ${msg.safetyData.actionTaken}*` : ''}
`;
  }).join('\n');
}

function generateBreakthroughSection(data: SessionExportData): string {
  if (data.breakthroughs.length === 0) return 'No breakthrough moments detected';

  return data.breakthroughs.map(breakthrough => {
    const timestamp = new Date(breakthrough.ts).toISOString().substring(11, 16);
    const intensity = '⭐'.repeat(Math.ceil(breakthrough.intensity * 5));

    return `### ${timestamp} - Breakthrough ${intensity}

**Description**: ${breakthrough.description}

${breakthrough.context ? `**Context**: ${breakthrough.context}` : ''}

**Intensity**: ${(breakthrough.intensity * 100).toFixed(0)}%
${breakthrough.themes?.length > 0 ? `**Themes**: ${breakthrough.themes.join(', ')}` : ''}
`;
  }).join('\n');
}

function generateSafetySection(data: SessionExportData): string {
  const safetyEvents = data.safetyEvents.filter(e => e.risk_level !== 'none');

  if (safetyEvents.length === 0) return '✅ No safety concerns detected';

  return `**Overall Risk Level**: ${data.riskLevel.toUpperCase()}
**Total Interventions**: ${data.interventions}

### Safety Events:

${safetyEvents.map(event => {
  const timestamp = new Date(event.ts).toISOString().substring(11, 16);
  const riskEmoji = event.risk_level === 'high' ? '🚨' :
                   event.risk_level === 'moderate' ? '⚠️' : '🟡';

  return `- **${timestamp}** ${riskEmoji} ${event.risk_level.toUpperCase()} - Action: ${event.action_taken}`;
}).join('\n')}`;
}

function generateEmotionalSection(data: SessionExportData): string {
  if (data.emotionalPatterns.length === 0) return 'No emotional pattern data available';

  const avgPattern = calculateAverageEmotionalPattern(data.emotionalPatterns);

  return `**Average Emotional Balance**:
- 🔥 Fire: ${(avgPattern.fire * 100).toFixed(1)}%
- 🌊 Water: ${(avgPattern.water * 100).toFixed(1)}%
- 🌍 Earth: ${(avgPattern.earth * 100).toFixed(1)}%
- 💨 Air: ${(avgPattern.air * 100).toFixed(1)}%

**Overall Balance Score**: ${(avgPattern.balance * 100).toFixed(1)}%
**Sentiment Trend**: ${avgPattern.sentiment > 0 ? '📈 Positive' : avgPattern.sentiment < 0 ? '📉 Challenging' : '→ Neutral'}`;
}

function generateAssessmentSection(data: SessionExportData): string {
  if (data.assessments.length === 0) return 'No assessments completed';

  return data.assessments.map(assessment => {
    const timestamp = new Date(assessment.ts).toISOString().substring(11, 16);

    return `### ${timestamp} - ${assessment.assessment_type}

**Question**: ${assessment.question}
**Answer**: ${assessment.answer}
**Score**: ${assessment.score}${assessment.total_score ? `/${assessment.total_score}` : ''}
${assessment.interpretation ? `**Interpretation**: ${assessment.interpretation}` : ''}
`;
  }).join('\n');
}

function generateIntegrationNotes(data: SessionExportData): string {
  const notes: string[] = [];

  if (data.breakthroughs.length > 0) {
    notes.push(`🎆 ${data.breakthroughs.length} breakthrough moment${data.breakthroughs.length > 1 ? 's' : ''} for integration work`);
  }

  if (data.interventions > 0) {
    notes.push(`🛡️ ${data.interventions} safety intervention${data.interventions > 1 ? 's' : ''} - follow up recommended`);
  }

  if (data.coherenceScore > 0.8) {
    notes.push('📈 High coherence session - excellent integration opportunity');
  } else if (data.coherenceScore < 0.4) {
    notes.push('🌱 Lower coherence - may benefit from grounding practices');
  }

  if (data.themes.length > 3) {
    notes.push('🎯 Multiple themes active - rich material for synthesis');
  }

  return notes.length > 0 ? notes.map(note => `- ${note}`).join('\n') :
         '- Standard integration practices recommended';
}

async function saveToObsidianVault(data: SessionExportData, content: string): Promise<string> {
  const vaultPath = process.env.OBSIDIAN_VAULT_PATH || "./obsidian-vault";
  const sessionsDir = path.join(vaultPath, "AIN Consciousness Intelligence System", "Sessions");

  // Ensure directory exists
  fs.mkdirSync(sessionsDir, { recursive: true });

  const date = data.timestamp.toISOString().split('T')[0];
  const userPrefix = data.userId.substring(0, 8);
  const fileName = `${date}_${userPrefix}_${data.sessionId.substring(0, 8)}.md`;
  const filePath = path.join(sessionsDir, fileName);

  fs.writeFileSync(filePath, content);

  return fileName;
}

// Utility functions
function calculateSessionDuration(data: SessionExportData): number {
  if (data.messages.length < 2) return 1;

  const firstMessage = data.messages[0].timestamp;
  const lastMessage = data.messages[data.messages.length - 1].timestamp;

  return Math.max(1, Math.round((lastMessage.getTime() - firstMessage.getTime()) / 60000));
}

function getRiskLevelBanner(riskLevel: string): string {
  const banners = {
    'none': '',
    'low': '🟡 **Low Risk Session**',
    'moderate': '⚠️ **Moderate Risk Session - Enhanced Monitoring**',
    'high': '🚨 **HIGH RISK SESSION - INTERVENTION REQUIRED**',
    'crisis': '🆘 **CRISIS SESSION - IMMEDIATE SUPPORT ACTIVATED**'
  };

  return banners[riskLevel as keyof typeof banners] || '';
}

function getSessionElements(data: SessionExportData): string[] {
  const elements = new Set<string>();

  data.emotionalPatterns.forEach(pattern => {
    if (pattern.dominant_emotion) {
      elements.add(pattern.dominant_emotion);
    }
  });

  data.messages.forEach(msg => {
    if (msg.element) {
      elements.add(msg.element);
    }
  });

  return Array.from(elements);
}

function calculateAverageEmotionalPattern(patterns: any[]): any {
  if (patterns.length === 0) return { fire: 0, water: 0, earth: 0, air: 0, balance: 0, sentiment: 0 };

  return patterns.reduce((avg, pattern) => ({
    fire: avg.fire + (pattern.fire_score || 0),
    water: avg.water + (pattern.water_score || 0),
    earth: avg.earth + (pattern.earth_score || 0),
    air: avg.air + (pattern.air_score || 0),
    balance: avg.balance + (pattern.balance_score || 0),
    sentiment: avg.sentiment + (pattern.sentiment_score || 0)
  }), { fire: 0, water: 0, earth: 0, air: 0, balance: 0, sentiment: 0 });
}

function getArchetypeEmoji(archetype: string): string {
  const emojis = {
    'sage': '🧙‍♂️',
    'hero': '⚔️',
    'lover': '💕',
    'magician': '🔮',
    'healer': '🙏',
    'shadow': '🌑',
    'mystic': '🌟',
    'warrior': '🛡️',
    'explorer': '🗺️',
    'creator': '🎨'
  };
  return emojis[archetype.toLowerCase() as keyof typeof emojis] || '🎭';
}

function extractArchetypesFromText(text: string): string[] {
  const archetypes = ['sage', 'hero', 'lover', 'magician', 'healer', 'shadow', 'mystic', 'warrior', 'explorer', 'creator'];
  return archetypes.filter(archetype => text.toLowerCase().includes(archetype));
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export { exportSessionToObsidian };