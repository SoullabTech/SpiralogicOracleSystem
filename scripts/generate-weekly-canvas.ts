/**
 * Weekly Obsidian Canvas Generator
 * Automatically creates visual maps of consciousness journeys, safety events, and archetypal patterns
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SessionData {
  id: string;
  user_id: string;
  created_at: string;
  risk_level: string;
  themes: string[];
  archetypes: string[];
  coherence_score: number;
  element: string;
  breakthrough_count: number;
  safety_interventions: number;
}

interface CanvasNode {
  id: string;
  type: "note" | "text" | "group";
  file?: string;
  text?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
}

interface CanvasEdge {
  id: string;
  fromNode: string;
  toNode: string;
  color?: string;
  label?: string;
}

interface ObsidianCanvas {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

async function generateWeeklyCanvas(): Promise<void> {
  console.log('🎨 Generating Weekly Consciousness Canvas...');

  const now = new Date();
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay() - 7));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  console.log(`📅 Week: ${weekStart.toISOString().split('T')[0]} to ${weekEnd.toISOString().split('T')[0]}`);

  // Fetch session data
  const sessions = await fetchWeeklySessionData(weekStart, weekEnd);
  const themeMap = extractThemes(sessions);
  const archetypeMap = extractArchetypes(sessions);
  const elementPatterns = extractElementalPatterns(sessions);

  // Generate canvas
  const canvas = buildCanvas(sessions, themeMap, archetypeMap, elementPatterns);

  // Export to Obsidian vault
  await exportCanvas(canvas, weekStart);

  // Generate accompanying markdown report
  await generateWeeklyReport(sessions, themeMap, archetypeMap, weekStart);

  console.log('✅ Weekly Canvas and Report Generated');
}

async function fetchWeeklySessionData(weekStart: Date, weekEnd: Date): Promise<SessionData[]> {
  console.log('📊 Fetching session data...');

  // Get safety logs
  const { data: safetyLogs } = await supabase
    .from('user_safety')
    .select('*')
    .gte('ts', weekStart.toISOString())
    .lt('ts', weekEnd.toISOString());

  // Get emotional patterns
  const { data: emotionalPatterns } = await supabase
    .from('emotional_patterns')
    .select('*')
    .gte('ts', weekStart.toISOString())
    .lt('ts', weekEnd.toISOString());

  // Get breakthrough moments
  const { data: breakthroughs } = await supabase
    .from('breakthrough_moments')
    .select('*')
    .gte('ts', weekStart.toISOString())
    .lt('ts', weekEnd.toISOString());

  // Get growth metrics
  const { data: growthMetrics } = await supabase
    .from('growth_metrics')
    .select('*')
    .gte('ts', weekStart.toISOString())
    .lt('ts', weekEnd.toISOString());

  // Aggregate into session data
  const sessionsMap = new Map<string, SessionData>();

  // Process safety logs
  safetyLogs?.forEach(log => {
    const sessionKey = `${log.user_id}_${log.ts.split('T')[0]}`;
    if (!sessionsMap.has(sessionKey)) {
      sessionsMap.set(sessionKey, {
        id: sessionKey,
        user_id: log.user_id,
        created_at: log.ts,
        risk_level: 'none',
        themes: [],
        archetypes: [],
        coherence_score: 0,
        element: 'aether',
        breakthrough_count: 0,
        safety_interventions: 0
      });
    }

    const session = sessionsMap.get(sessionKey)!;
    if (getRiskPriority(log.risk_level) > getRiskPriority(session.risk_level)) {
      session.risk_level = log.risk_level;
    }
    session.safety_interventions++;
  });

  // Process emotional patterns
  emotionalPatterns?.forEach(pattern => {
    const sessionKey = `${pattern.user_id}_${pattern.ts.split('T')[0]}`;
    const session = sessionsMap.get(sessionKey);
    if (session) {
      session.element = pattern.dominant_emotion;
      // Extract themes from metadata if available
      if (pattern.metadata?.themes) {
        session.themes.push(...pattern.metadata.themes);
      }
    }
  });

  // Process breakthroughs
  breakthroughs?.forEach(breakthrough => {
    const sessionKey = `${breakthrough.user_id}_${breakthrough.ts.split('T')[0]}`;
    const session = sessionsMap.get(sessionKey);
    if (session) {
      session.breakthrough_count++;
      if (breakthrough.themes) {
        session.themes.push(...breakthrough.themes);
      }
      // Extract archetypes from description
      session.archetypes.push(...extractArchetypesFromText(breakthrough.description));
    }
  });

  // Process growth metrics
  growthMetrics?.forEach(metric => {
    const sessionKey = `${metric.user_id}_${metric.ts.split('T')[0]}`;
    const session = sessionsMap.get(sessionKey);
    if (session && metric.metric_type === 'coherence') {
      session.coherence_score = Math.max(session.coherence_score, metric.value);
    }
  });

  return Array.from(sessionsMap.values());
}

function extractThemes(sessions: SessionData[]): Map<string, number> {
  const themeMap = new Map<string, number>();

  sessions.forEach(session => {
    session.themes.forEach(theme => {
      themeMap.set(theme, (themeMap.get(theme) || 0) + 1);
    });
  });

  return themeMap;
}

function extractArchetypes(sessions: SessionData[]): Map<string, { count: number; elements: string[] }> {
  const archetypeMap = new Map<string, { count: number; elements: string[] }>();

  sessions.forEach(session => {
    session.archetypes.forEach(archetype => {
      if (!archetypeMap.has(archetype)) {
        archetypeMap.set(archetype, { count: 0, elements: [] });
      }
      const entry = archetypeMap.get(archetype)!;
      entry.count++;
      if (!entry.elements.includes(session.element)) {
        entry.elements.push(session.element);
      }
    });
  });

  return archetypeMap;
}

function extractElementalPatterns(sessions: SessionData[]): Map<string, { count: number; riskLevel: string }> {
  const elementMap = new Map<string, { count: number; riskLevel: string }>();

  sessions.forEach(session => {
    if (!elementMap.has(session.element)) {
      elementMap.set(session.element, { count: 0, riskLevel: 'none' });
    }
    const entry = elementMap.get(session.element)!;
    entry.count++;
    if (getRiskPriority(session.risk_level) > getRiskPriority(entry.riskLevel)) {
      entry.riskLevel = session.risk_level;
    }
  });

  return elementMap;
}

function buildCanvas(
  sessions: SessionData[],
  themeMap: Map<string, number>,
  archetypeMap: Map<string, { count: number; elements: string[] }>,
  elementPatterns: Map<string, { count: number; riskLevel: string }>
): ObsidianCanvas {
  const nodes: CanvasNode[] = [];
  const edges: CanvasEdge[] = [];

  // 1. Create session nodes (left side, risk-color coded)
  sessions.forEach((session, index) => {
    const color = getRiskColor(session.risk_level);
    const yPosition = index * 180;

    nodes.push({
      id: `session-${session.id}`,
      type: "note",
      file: `Sessions/${session.created_at.split('T')[0]}_${session.user_id.substring(0, 8)}.md`,
      x: 50,
      y: yPosition,
      width: 280,
      height: 150,
      color
    });
  });

  // 2. Create theme hub nodes (center)
  let themeYOffset = 0;
  themeMap.forEach((count, theme) => {
    if (count >= 2) { // Only show themes that appear multiple times
      nodes.push({
        id: `theme-${theme.toLowerCase().replace(/\s+/g, '-')}`,
        type: "text",
        text: `🎯 Theme: ${theme}\n(${count} sessions)`,
        x: 400,
        y: themeYOffset,
        width: 200,
        height: 120,
        color: "#e1f5fe"
      });

      // Connect sessions to themes
      sessions.forEach(session => {
        if (session.themes.includes(theme)) {
          edges.push({
            id: `${session.id}-${theme}`,
            fromNode: `session-${session.id}`,
            toNode: `theme-${theme.toLowerCase().replace(/\s+/g, '-')}`,
            color: "#2196f3"
          });
        }
      });

      themeYOffset += 140;
    }
  });

  // 3. Create archetype nodes (right side)
  let archetypeYOffset = 0;
  archetypeMap.forEach((data, archetype) => {
    if (data.count >= 2) {
      const elementEmojis = data.elements.map(el => getElementEmoji(el)).join('');

      nodes.push({
        id: `archetype-${archetype.toLowerCase().replace(/\s+/g, '-')}`,
        type: "text",
        text: `${getArchetypeEmoji(archetype)} ${archetype}\n${elementEmojis} (${data.count} appearances)`,
        x: 650,
        y: archetypeYOffset,
        width: 200,
        height: 120,
        color: "#f3e5f5"
      });

      // Connect sessions to archetypes
      sessions.forEach(session => {
        if (session.archetypes.includes(archetype)) {
          edges.push({
            id: `${session.id}-${archetype}`,
            fromNode: `session-${session.id}`,
            toNode: `archetype-${archetype.toLowerCase().replace(/\s+/g, '-')}`,
            color: "#9c27b0"
          });
        }
      });

      archetypeYOffset += 140;
    }
  });

  // 4. Create elemental pattern summary (top)
  let elementXOffset = 50;
  elementPatterns.forEach((data, element) => {
    const emoji = getElementEmoji(element);
    const color = getRiskColor(data.riskLevel);

    nodes.push({
      id: `element-${element}`,
      type: "text",
      text: `${emoji} ${element.toUpperCase()}\n${data.count} sessions\nRisk: ${data.riskLevel}`,
      x: elementXOffset,
      y: -150,
      width: 150,
      height: 100,
      color
    });

    elementXOffset += 170;
  });

  // 5. Create weekly summary node (top center)
  const totalSessions = sessions.length;
  const crisisCount = sessions.filter(s => s.risk_level === 'high').length;
  const breakthroughTotal = sessions.reduce((sum, s) => sum + s.breakthrough_count, 0);
  const avgCoherence = sessions.reduce((sum, s) => sum + s.coherence_score, 0) / totalSessions || 0;

  nodes.push({
    id: "weekly-summary",
    type: "text",
    text: `📊 WEEKLY CONSCIOUSNESS MAP\n\n` +
          `Sessions: ${totalSessions}\n` +
          `Breakthroughs: ${breakthroughTotal}\n` +
          `Crisis Events: ${crisisCount}\n` +
          `Avg Coherence: ${(avgCoherence * 100).toFixed(1)}%`,
    x: 350,
    y: -180,
    width: 250,
    height: 150,
    color: "#fff3e0"
  });

  return { nodes, edges };
}

async function exportCanvas(canvas: ObsidianCanvas, weekStart: Date): Promise<void> {
  const weekNum = getWeekNumber(weekStart);
  const year = weekStart.getFullYear();

  const vaultPath = process.env.OBSIDIAN_VAULT_PATH || "./obsidian-vault";
  const canvasDir = path.join(vaultPath, "AIN Consciousness Intelligence System", "Canvas", "Weekly");

  // Ensure directory exists
  fs.mkdirSync(canvasDir, { recursive: true });

  const fileName = `${year}-W${weekNum.toString().padStart(2, '0')}-Consciousness-Map.canvas`;
  const filePath = path.join(canvasDir, fileName);

  fs.writeFileSync(filePath, JSON.stringify(canvas, null, 2));
  console.log(`📁 Canvas exported: ${fileName}`);
}

async function generateWeeklyReport(
  sessions: SessionData[],
  themeMap: Map<string, number>,
  archetypeMap: Map<string, { count: number; elements: string[] }>,
  weekStart: Date
): Promise<void> {
  const weekNum = getWeekNumber(weekStart);
  const year = weekStart.getFullYear();

  const vaultPath = process.env.OBSIDIAN_VAULT_PATH || "./obsidian-vault";
  const reportsDir = path.join(vaultPath, "AIN Consciousness Intelligence System", "Reports", "Weekly");

  fs.mkdirSync(reportsDir, { recursive: true });

  const fileName = `${year}-W${weekNum.toString().padStart(2, '0')}-Consciousness-Report.md`;
  const filePath = path.join(reportsDir, fileName);

  const report = generateMarkdownReport(sessions, themeMap, archetypeMap, weekStart);

  fs.writeFileSync(filePath, report);
  console.log(`📝 Report exported: ${fileName}`);
}

function generateMarkdownReport(
  sessions: SessionData[],
  themeMap: Map<string, number>,
  archetypeMap: Map<string, { count: number; elements: string[] }>,
  weekStart: Date
): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const totalBreakthroughs = sessions.reduce((sum, s) => sum + s.breakthrough_count, 0);
  const crisisCount = sessions.filter(s => s.risk_level === 'high').length;
  const moderateRiskCount = sessions.filter(s => s.risk_level === 'moderate').length;
  const avgCoherence = sessions.reduce((sum, s) => sum + s.coherence_score, 0) / sessions.length || 0;

  return `---
title: Weekly Consciousness Intelligence Report
week: ${getWeekNumber(weekStart)}
year: ${weekStart.getFullYear()}
date_range: ${weekStart.toISOString().split('T')[0]} to ${weekEnd.toISOString().split('T')[0]}
total_sessions: ${sessions.length}
crisis_events: ${crisisCount}
breakthrough_moments: ${totalBreakthroughs}
avg_coherence: ${(avgCoherence * 100).toFixed(1)}%
tags: [weekly-report, consciousness-intelligence, ain-analytics]
---

# 🌌 Weekly Consciousness Intelligence Report

**Week ${getWeekNumber(weekStart)}, ${weekStart.getFullYear()}** | ${weekStart.toISOString().split('T')[0]} → ${weekEnd.toISOString().split('T')[0]}

## 📊 Executive Summary

- **Total Sessions**: ${sessions.length}
- **Breakthrough Moments**: ${totalBreakthroughs}
- **Crisis Interventions**: ${crisisCount}
- **Moderate Risk Events**: ${moderateRiskCount}
- **Average Coherence Level**: ${(avgCoherence * 100).toFixed(1)}%

## 🎯 Dominant Themes

${Array.from(themeMap.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([theme, count]) => `- **${theme}**: ${count} sessions`)
  .join('\n')}

## 🏛️ Active Archetypes

${Array.from(archetypeMap.entries())
  .sort((a, b) => b[1].count - a[1].count)
  .slice(0, 5)
  .map(([archetype, data]) =>
    `- **${archetype}**: ${data.count} appearances across ${data.elements.join(', ')} elements`
  )
  .join('\n')}

## 🔥🌊🌍💨✨ Elemental Distribution

${['fire', 'water', 'earth', 'air', 'aether'].map(element => {
  const count = sessions.filter(s => s.element === element).length;
  const percentage = ((count / sessions.length) * 100).toFixed(1);
  return `- ${getElementEmoji(element)} **${element.toUpperCase()}**: ${count} sessions (${percentage}%)`;
}).join('\n')}

## 🚨 Safety Overview

${crisisCount > 0 ? `
### Crisis Events (${crisisCount})
${sessions.filter(s => s.risk_level === 'high').map(s =>
  `- Session ${s.id.substring(0, 8)}: ${s.created_at.split('T')[0]} (${s.element} element)`
).join('\n')}
` : '✅ No crisis events this week'}

${moderateRiskCount > 0 ? `
### Moderate Risk Events (${moderateRiskCount})
${sessions.filter(s => s.risk_level === 'moderate').map(s =>
  `- Session ${s.id.substring(0, 8)}: ${s.created_at.split('T')[0]} (${s.element} element)`
).join('\n')}
` : ''}

## 🎆 Breakthrough Highlights

${totalBreakthroughs > 0 ? `
Total breakthrough moments: **${totalBreakthroughs}**

${sessions.filter(s => s.breakthrough_count > 0).map(s =>
  `- Session ${s.id.substring(0, 8)}: ${s.breakthrough_count} breakthrough${s.breakthrough_count > 1 ? 's' : ''} (${s.element} element)`
).join('\n')}
` : 'No breakthrough moments detected this week.'}

## 📈 Growth Patterns

- **Coherence Trend**: ${avgCoherence > 0.7 ? '📈 High' : avgCoherence > 0.4 ? '→ Stable' : '📉 Developing'}
- **Risk Management**: ${crisisCount === 0 ? '✅ Excellent' : crisisCount < 3 ? '⚠️ Managed' : '🚨 Active Support Needed'}
- **Breakthrough Rate**: ${totalBreakthroughs / sessions.length > 0.5 ? '🎯 High Discovery' : '🌱 Steady Growth'}

## 🔄 Weekly Insights

${generateWeeklyInsights(sessions, themeMap, archetypeMap)}

## 📋 Next Week Focus

${generateNextWeekFocus(sessions, themeMap, archetypeMap)}

---

*Generated by AIN Consciousness Intelligence System*
*Canvas Visualization: [[${weekStart.getFullYear()}-W${getWeekNumber(weekStart).toString().padStart(2, '0')}-Consciousness-Map.canvas]]*
`;
}

function generateWeeklyInsights(
  sessions: SessionData[],
  themeMap: Map<string, number>,
  archetypeMap: Map<string, { count: number; elements: string[] }>
): string {
  const insights: string[] = [];

  // Theme insights
  const topTheme = Array.from(themeMap.entries()).sort((a, b) => b[1] - a[1])[0];
  if (topTheme) {
    insights.push(`The dominant theme "${topTheme[0]}" appeared in ${topTheme[1]} sessions, suggesting a collective focus on this area of growth.`);
  }

  // Archetype insights
  const topArchetype = Array.from(archetypeMap.entries()).sort((a, b) => b[1].count - a[1].count)[0];
  if (topArchetype) {
    insights.push(`The ${topArchetype[0]} archetype was most active, appearing across ${topArchetype[1].elements.join(' and ')} elements.`);
  }

  // Risk pattern insights
  const riskySessions = sessions.filter(s => s.risk_level === 'high' || s.risk_level === 'moderate');
  if (riskySessions.length > 0) {
    const riskyElements = [...new Set(riskySessions.map(s => s.element))];
    insights.push(`Safety interventions were most needed in ${riskyElements.join(' and ')} element sessions.`);
  }

  return insights.length > 0 ? insights.map(i => `- ${i}`).join('\n') : '- Week showed balanced consciousness development patterns.';
}

function generateNextWeekFocus(
  sessions: SessionData[],
  themeMap: Map<string, number>,
  archetypeMap: Map<string, { count: number; elements: string[] }>
): string {
  const recommendations: string[] = [];

  // Based on crisis patterns
  const crisisCount = sessions.filter(s => s.risk_level === 'high').length;
  if (crisisCount > 0) {
    recommendations.push('Continue enhanced safety monitoring for high-risk patterns');
  }

  // Based on breakthrough patterns
  const breakthroughTotal = sessions.reduce((sum, s) => sum + s.breakthrough_count, 0);
  if (breakthroughTotal > sessions.length * 0.5) {
    recommendations.push('Integration practices to consolidate breakthrough insights');
  }

  // Based on elemental imbalance
  const elementCounts = ['fire', 'water', 'earth', 'air', 'aether'].map(element => ({
    element,
    count: sessions.filter(s => s.element === element).length
  }));
  const maxElement = elementCounts.reduce((max, current) => current.count > max.count ? current : max);
  const minElement = elementCounts.reduce((min, current) => current.count < min.count ? current : min);

  if (maxElement.count > minElement.count * 3) {
    recommendations.push(`Consider ${minElement.element} element practices to restore elemental balance`);
  }

  return recommendations.length > 0 ? recommendations.map(r => `- ${r}`).join('\n') : '- Continue current consciousness development patterns';
}

// Utility functions
function getRiskPriority(riskLevel: string): number {
  const priorities = { 'none': 0, 'low': 1, 'moderate': 2, 'high': 3, 'crisis': 4 };
  return priorities[riskLevel as keyof typeof priorities] || 0;
}

function getRiskColor(riskLevel: string): string {
  const colors = {
    'none': '#e8f5e8',
    'low': '#fff3cd',
    'moderate': '#ffeaa7',
    'high': '#fab1a0',
    'crisis': '#ff7675'
  };
  return colors[riskLevel as keyof typeof colors] || '#f8f9fa';
}

function getElementEmoji(element: string): string {
  const emojis = {
    'fire': '🔥',
    'water': '🌊',
    'earth': '🌍',
    'air': '💨',
    'aether': '✨'
  };
  return emojis[element as keyof typeof emojis] || '⚪';
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
  const found: string[] = [];

  archetypes.forEach(archetype => {
    if (text.toLowerCase().includes(archetype)) {
      found.push(archetype);
    }
  });

  return found;
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Enhanced archetype hub functionality
async function updateArchetypeHub(
  archetypeMap: Map<string, { count: number; elements: string[] }>,
  weekStart: Date
): Promise<void> {
  console.log('🌌 Updating Archetype Hub...');

  const vaultPath = process.env.OBSIDIAN_VAULT_PATH || "./obsidian-vault";
  const hubPath = path.join(vaultPath, "AIN Consciousness Intelligence System", "Canvas", "Archetype-Hub.canvas");

  // Load existing hub or create new one
  let existingCanvas: ObsidianCanvas = { nodes: [], edges: [] };
  try {
    const existingData = fs.readFileSync(hubPath, 'utf-8');
    existingCanvas = JSON.parse(existingData);
  } catch (error) {
    console.log('📝 Creating new Archetype Hub...');
  }

  // Collect archetype frequencies across time
  const archetypeFrequencies = new Map<string, { count: number; lastSeen: Date; intensity: number }>();

  // Process existing nodes to preserve historical data
  existingCanvas.nodes.forEach(node => {
    if (node.id?.startsWith('archetype-hub-')) {
      const archetyText = node.text || '';
      const match = archetyText.match(/⚡ (.+?)\n/);
      if (match) {
        const archetype = match[1];
        const countMatch = archetyText.match(/Count: (\d+)/);
        const count = countMatch ? parseInt(countMatch[1]) : 0;

        archetypeFrequencies.set(archetype, {
          count,
          lastSeen: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Week ago
          intensity: Math.min(count / 10, 1)
        });
      }
    }
  });

  // Add new archetypes from this week
  archetypeMap.forEach((data, archetype) => {
    const existing = archetypeFrequencies.get(archetype);
    if (existing) {
      existing.count += data.count;
      existing.lastSeen = weekStart;
      existing.intensity = Math.min(existing.count / 10, 1);
    } else {
      archetypeFrequencies.set(archetype, {
        count: data.count,
        lastSeen: weekStart,
        intensity: Math.min(data.count / 10, 1)
      });
    }
  });

  // Create new hub canvas
  const hubNodes: CanvasNode[] = [];
  const hubEdges: CanvasEdge[] = [];

  // Central hub node
  hubNodes.push({
    id: 'archetype-center',
    type: 'text',
    text: `🌌 MAIA Archetype Hub\n\nTotal Archetypes: ${archetypeFrequencies.size}\nLast Updated: ${weekStart.toISOString().split('T')[0]}\n\nLong-term archetypal patterns across all consciousness journeys`,
    x: 0,
    y: 0,
    width: 400,
    height: 200,
    color: '#e8eaf6'
  });

  // Archetype nodes in circular layout
  const radius = 500;
  const angleStep = (2 * Math.PI) / Math.max(archetypeFrequencies.size, 1);

  let index = 0;
  archetypeFrequencies.forEach((freq, archetype) => {
    const angle = index * angleStep;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    // Color based on intensity
    const nodeColor = freq.intensity > 0.7 ? '#e1bee7' :
                     freq.intensity > 0.4 ? '#f8bbd9' :
                     '#e8f5e8';

    const daysSinceLastSeen = Math.floor((Date.now() - freq.lastSeen.getTime()) / (1000 * 60 * 60 * 24));

    hubNodes.push({
      id: `archetype-hub-${archetype.toLowerCase().replace(/\s+/g, '-')}`,
      type: 'text',
      text: `⚡ ${archetype}\n\nCount: ${freq.count}\nLast Seen: ${daysSinceLastSeen}d ago\nIntensity: ${'●'.repeat(Math.round(freq.intensity * 5))}\n\n"${getArchetypeWisdom(archetype)}"`,
      x: x,
      y: y,
      width: 220,
      height: 180,
      color: nodeColor
    });

    // Connect to center with varying intensity
    hubEdges.push({
      id: `hub-edge-${index}`,
      fromNode: 'archetype-center',
      toNode: `archetype-hub-${archetype.toLowerCase().replace(/\s+/g, '-')}`,
      color: freq.intensity > 0.5 ? '#9c27b0' : '#e1bee7'
    });

    index++;
  });

  const hubCanvas: ObsidianCanvas = { nodes: hubNodes, edges: hubEdges };

  // Ensure directory exists
  fs.mkdirSync(path.dirname(hubPath), { recursive: true });
  fs.writeFileSync(hubPath, JSON.stringify(hubCanvas, null, 2));

  console.log(`🌌 Archetype Hub updated with ${archetypeFrequencies.size} archetypes`);
}

function getArchetypeWisdom(archetype: string): string {
  const wisdom = {
    'sage': 'Wisdom emerges through contemplation and inner knowing',
    'hero': 'Courage transforms challenges into growth opportunities',
    'lover': 'Connection deepens through authentic vulnerability',
    'magician': 'Transformation occurs through conscious intention',
    'healer': 'Wholeness flows through compassionate presence',
    'shadow': 'Integration embraces all aspects of self',
    'mystic': 'Unity consciousness transcends ordinary perception',
    'warrior': 'Strength serves the highest truth',
    'explorer': 'Discovery unfolds through curious engagement',
    'creator': 'Expression manifests inner vision into form'
  };

  return wisdom[archetype.toLowerCase() as keyof typeof wisdom] || 'Ancient wisdom awakens in the present moment';
}

// Enhanced main function
async function generateWeeklyCanvasEnhanced(): Promise<void> {
  console.log('🎨 Generating Enhanced Weekly Consciousness Canvas...');

  const now = new Date();
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay() - 7));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  console.log(`📅 Week: ${weekStart.toISOString().split('T')[0]} to ${weekEnd.toISOString().split('T')[0]}`);

  // Fetch session data
  const sessions = await fetchWeeklySessionData(weekStart, weekEnd);
  const themeMap = extractThemes(sessions);
  const archetypeMap = extractArchetypes(sessions);
  const elementPatterns = extractElementalPatterns(sessions);

  // Generate main weekly canvas
  const canvas = buildCanvas(sessions, themeMap, archetypeMap, elementPatterns);
  await exportCanvas(canvas, weekStart);

  // Update long-term archetype hub
  await updateArchetypeHub(archetypeMap, weekStart);

  // Generate accompanying markdown report
  await generateWeeklyReport(sessions, themeMap, archetypeMap, weekStart);

  // Generate monthly canvas if it's the last week of the month
  const nextWeek = new Date(weekEnd);
  nextWeek.setDate(weekEnd.getDate() + 1);
  if (weekEnd.getMonth() !== nextWeek.getMonth()) {
    await generateMonthlyCanvas(weekStart);
  }

  console.log('✅ Enhanced Weekly Canvas, Archetype Hub, and Report Generated');
}

async function generateMonthlyCanvas(weekStart: Date): Promise<void> {
  console.log('📅 Generating Monthly Archetypal Patterns Canvas...');

  const monthStart = new Date(weekStart.getFullYear(), weekStart.getMonth(), 1);
  const monthEnd = new Date(weekStart.getFullYear(), weekStart.getMonth() + 1, 0);

  // Fetch month's data
  const sessions = await fetchWeeklySessionData(monthStart, monthEnd);
  const archetypeMap = extractArchetypes(sessions);

  // Create monthly archetypal constellation
  const monthlyNodes: CanvasNode[] = [];
  const monthlyEdges: CanvasEdge[] = [];

  // Month overview
  monthlyNodes.push({
    id: 'month-overview',
    type: 'text',
    text: `📅 ${monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}\n\nMonthly Archetypal Constellation\n${sessions.length} total sessions\n${archetypeMap.size} active archetypes`,
    x: 0,
    y: 0,
    width: 400,
    height: 200,
    color: '#fff3e0'
  });

  // Create constellation of monthly archetypes
  const radius = 300;
  const angleStep = (2 * Math.PI) / Math.max(archetypeMap.size, 1);

  let index = 0;
  archetypeMap.forEach((data, archetype) => {
    const angle = index * angleStep;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    monthlyNodes.push({
      id: `monthly-${archetype.toLowerCase().replace(/\s+/g, '-')}`,
      type: 'text',
      text: `${getArchetypeEmoji(archetype)} ${archetype}\n\nMonthly Count: ${data.count}\nElements: ${data.elements.join(', ')}`,
      x: x,
      y: y,
      width: 200,
      height: 150,
      color: '#f3e5f5'
    });

    monthlyEdges.push({
      id: `monthly-edge-${index}`,
      fromNode: 'month-overview',
      toNode: `monthly-${archetype.toLowerCase().replace(/\s+/g, '-')}`,
      color: '#9c27b0'
    });

    index++;
  });

  const monthlyCanvas: ObsidianCanvas = { nodes: monthlyNodes, edges: monthlyEdges };

  // Export monthly canvas
  const vaultPath = process.env.OBSIDIAN_VAULT_PATH || "./obsidian-vault";
  const monthlyDir = path.join(vaultPath, "AIN Consciousness Intelligence System", "Canvas", "Monthly");
  fs.mkdirSync(monthlyDir, { recursive: true });

  const monthlyFileName = `${monthStart.getFullYear()}-${(monthStart.getMonth() + 1).toString().padStart(2, '0')}-Archetypal-Constellation.canvas`;
  const monthlyFilePath = path.join(monthlyDir, monthlyFileName);

  fs.writeFileSync(monthlyFilePath, JSON.stringify(monthlyCanvas, null, 2));
  console.log(`🌙 Monthly canvas generated: ${monthlyFileName}`);
}

// Main execution with enhanced functionality
if (require.main === module) {
  generateWeeklyCanvasEnhanced().catch(console.error);
}


// Enhanced version that accepts external data and options
async function generateWeeklyCanvasWithOptions(
  sessionsData?: any[],
  options?: { updateArchetypeHub?: boolean; vaultPath?: string }
): Promise<void> {
  if (options?.updateArchetypeHub && sessionsData) {
    // Use provided sessions data for archetype analysis
    const vaultPath = options.vaultPath || process.env.OBSIDIAN_VAULT_PATH || "./obsidian-vault";

    // Extract archetypes from sessions
    const archetypeMap = new Map<string, { count: number; elements: string[] }>();

    for (const session of sessionsData) {
      if (session.breakthroughs && session.breakthroughs.length > 0) {
        for (const breakthrough of session.breakthroughs) {
          if (breakthrough.archetypal_resonance) {
            const archetype = breakthrough.archetypal_resonance.split(' - ')[0]; // Extract archetype name
            if (!archetypeMap.has(archetype)) {
              archetypeMap.set(archetype, { count: 0, elements: [] });
            }
            const entry = archetypeMap.get(archetype)!;
            entry.count++;
            entry.elements.push(session.risk_level);
          }
        }
      }
    }

    // Update the archetype hub with 4 weeks of data
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    await updateArchetypeHub(archetypeMap, startOfMonth, vaultPath);

    console.log('🌟 Archetype Hub updated with Monday batch data');
  }

  // Run the standard weekly canvas generation
  await generateWeeklyCanvasEnhanced();
}

// Export the enhanced version as the main function
const generateWeeklyCanvas = generateWeeklyCanvasWithOptions;

export { generateWeeklyCanvas, generateWeeklyCanvasEnhanced, updateArchetypeHub };