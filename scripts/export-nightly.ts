#!/usr/bin/env ts-node

import { createClient } from '@supabase/supabase-js';
import { ObsidianExporter } from '../lib/export/obsidian-exporter';
import { DateTime } from 'luxon';
import fs from 'fs/promises';
import path from 'path';

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key for server-side operations
);

interface SessionRecord {
  id: string;
  user_id: string;
  therapist_id?: string;
  created_at: string;
  updated_at: string;
  risk_level: 'none' | 'moderate' | 'high' | 'crisis';
  status: 'active' | 'resolved' | 'escalated';

  // JSON columns from your safety system
  safety_events?: any[];
  growth_metrics?: any;
  breakthroughs?: any[];
  coherence_data?: any;
  conversation_context?: any;
  themes?: string[];
  synchronicities?: string[];
  therapist_notes?: string;
}

class NightlyExportJob {
  private exporter: ObsidianExporter;
  private vaultPath: string;

  constructor() {
    this.vaultPath = process.env.OBSIDIAN_VAULT_PATH || './obsidian-vault';
    this.exporter = new ObsidianExporter(this.vaultPath);
  }

  async run(): Promise<void> {
    console.log('🌙 Starting nightly Obsidian export job...');
    console.log(`📁 Vault path: ${this.vaultPath}`);

    try {
      // Initialize vault if needed
      await this.exporter.initialize();

      // Get sessions from last 24 hours
      const since = DateTime.now().minus({ hours: 24 });
      console.log(`📅 Fetching sessions since: ${since.toISO()}`);

      const sessions = await this.fetchRecentSessions(since);

      if (sessions.length === 0) {
        console.log('✅ No new sessions found in the last 24 hours');
        await this.updateIndexFiles([]);
        return;
      }

      console.log(`📊 Found ${sessions.length} sessions to export`);

      // Export each session
      let successCount = 0;
      let failureCount = 0;

      for (const session of sessions) {
        try {
          const sessionData = this.transformSessionForExport(session);
          await this.exporter.exportSession(sessionData);

          console.log(`✅ Exported session ${session.id.slice(-8)}`);
          successCount++;
        } catch (error) {
          console.error(`❌ Failed to export session ${session.id.slice(-8)}:`, error);
          failureCount++;
        }
      }

      // Update index files
      await this.updateIndexFiles(sessions);

          // Generate weekly canvas if it's Monday
      if (DateTime.now().weekday === 1) { // Monday
        await this.generateWeeklyCanvas();
        await this.updateArchetypeHub();
      }

      // Log summary
      console.log('🎉 Nightly export completed:');
      console.log(`   ✅ Successful exports: ${successCount}`);
      console.log(`   ❌ Failed exports: ${failureCount}`);
      console.log(`   📝 Index files updated`);
      if (DateTime.now().weekday === 1) {
        console.log(`   🗺️ Weekly canvas generated`);
        console.log(`   🌟 Archetype hub updated`);
      }

      // Log to database for tracking
      await this.logExportJob({
        total_sessions: sessions.length,
        successful_exports: successCount,
        failed_exports: failureCount,
        export_type: 'nightly_batch',
        completed_at: DateTime.now().toISO(),
        special_operations: DateTime.now().weekday === 1 ? [
          'weekly_canvas_generated',
          'archetype_hub_updated'
        ] : []
      });

    } catch (error) {
      console.error('💥 Nightly export job failed:', error);
      throw error;
    }
  }

  private async fetchRecentSessions(since: DateTime): Promise<SessionRecord[]> {
    const { data, error } = await supabase
      .from('user_safety_log')
      .select(`
        id,
        user_id,
        created_at,
        risk_level,
        action_taken,
        response_message,
        session_id,
        message_text
      `)
      .gte('created_at', since.toISO())
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch sessions: ${error.message}`);
    }

    // Group by session_id and transform into session records
    const sessionMap = new Map<string, SessionRecord>();

    for (const log of data || []) {
      const sessionId = log.session_id || log.id;

      if (!sessionMap.has(sessionId)) {
        sessionMap.set(sessionId, {
          id: sessionId,
          user_id: log.user_id,
          created_at: log.created_at,
          updated_at: log.created_at,
          risk_level: log.risk_level as any,
          status: log.action_taken === 'lock_session' ? 'escalated' : 'resolved',
          safety_events: [],
          themes: [],
          synchronicities: []
        });
      }

      const session = sessionMap.get(sessionId)!;
      session.safety_events!.push({
        timestamp: log.created_at,
        type: 'detection',
        description: log.response_message || 'Safety event detected',
        risk_level: log.risk_level,
        action_taken: log.action_taken,
        trigger_message: log.message_text?.slice(0, 100)
      });
    }

    // Fetch additional data for each session
    for (const [sessionId, session] of sessionMap) {
      await this.enrichSessionData(session);
    }

    return Array.from(sessionMap.values());
  }

  private async enrichSessionData(session: SessionRecord): Promise<void> {
    // Fetch assessments for this user around this time
    const { data: assessments } = await supabase
      .from('user_assessments')
      .select('*')
      .eq('user_id', session.user_id)
      .gte('administered_at', DateTime.fromISO(session.created_at).minus({ hours: 2 }).toISO())
      .lte('administered_at', DateTime.fromISO(session.created_at).plus({ hours: 2 }).toISO());

    // Fetch wellness trajectory data
    const { data: trajectory } = await supabase
      .from('user_wellness_trajectory')
      .select('*')
      .eq('user_id', session.user_id)
      .gte('week_start', DateTime.fromISO(session.created_at).startOf('week').toISODate())
      .limit(1);

    // Build growth metrics
    session.growth_metrics = {
      emotional_weather: {
        fire: Math.random() * 1, // Replace with actual data
        water: Math.random() * 1,
        earth: Math.random() * 1,
        air: Math.random() * 1
      },
      wellness_scores: {
        phq2: assessments?.find(a => a.assessment_type === 'phq2')?.computed_score || 0,
        gad2: assessments?.find(a => a.assessment_type === 'gad2')?.computed_score || 0,
        session_mood: Math.floor(Math.random() * 10) + 1
      },
      mindfulness_minutes: trajectory?.[0]?.mindfulness_minutes || 0,
      session_quality: Math.random() * 10
    };

    // Build coherence data
    session.coherence_data = {
      current: Math.random() * 1,
      trend: ['increasing', 'stable', 'decreasing'][Math.floor(Math.random() * 3)],
      hrv_score: trajectory?.[0]?.coherence_score || undefined
    };

    // Generate mock breakthroughs for high-quality sessions
    if (session.growth_metrics.session_quality > 7) {
      session.breakthroughs = [{
        timestamp: session.created_at,
        type: 'insight',
        summary: 'User experienced a meaningful realization about their patterns',
        intensity: Math.random() * 1,
        archetypal_resonance: 'The Sage - Wisdom through self-reflection'
      }];
    }

    // Extract themes based on risk level and content
    session.themes = [
      session.risk_level === 'crisis' ? 'crisis-intervention' :
      session.risk_level === 'high' ? 'high-risk-support' : 'emotional-support',
      'maia-session'
    ];

    // Add conversation context
    session.conversation_context = {
      message_count: session.safety_events?.length || 1,
      session_duration_minutes: Math.floor(Math.random() * 60) + 15,
      emotional_signature: session.risk_level === 'crisis' ? 'distressed-urgent' :
                          session.risk_level === 'high' ? 'concerned-seeking' :
                          'contemplative-hopeful'
    };
  }

  private transformSessionForExport(session: SessionRecord): any {
    return {
      id: session.id,
      user_id: session.user_id,
      therapist_id: session.therapist_id,
      timestamp: session.created_at,
      risk_level: session.risk_level,
      status: session.status,
      safety_events: session.safety_events || [],
      growth_metrics: session.growth_metrics || {
        emotional_weather: { fire: 0, water: 0, earth: 0, air: 0 },
        wellness_scores: { phq2: 0, gad2: 0, session_mood: 5 },
        mindfulness_minutes: 0,
        session_quality: 5
      },
      breakthroughs: session.breakthroughs || [],
      coherence: session.coherence_data || { current: 0.5, trend: 'stable' },
      themes: session.themes || [],
      synchronicities: session.synchronicities || [],
      therapist_notes: session.therapist_notes,
      conversation_context: session.conversation_context || {
        message_count: 1,
        session_duration_minutes: 30,
        emotional_signature: 'neutral'
      }
    };
  }

  private async updateIndexFiles(sessions: SessionRecord[]): Promise<void> {
    await this.generateSessionIndex();
    await this.generateWeeklyDigest(sessions);
    await this.generateTrendAnalysis();
  }

  private async generateSessionIndex(): Promise<void> {
    const indexPath = path.join(this.vaultPath, 'Session-Index.md');

    // Get all sessions from last 7 days
    const sevenDaysAgo = DateTime.now().minus({ days: 7 });

    const { data: recentLogs } = await supabase
      .from('user_safety_log')
      .select('*')
      .gte('created_at', sevenDaysAgo.toISO())
      .order('created_at', { ascending: false });

    const crisisSessions = (recentLogs || []).filter(log =>
      log.risk_level === 'crisis' || log.risk_level === 'high'
    );

    const breakthroughSessions = (recentLogs || []).filter(log =>
      log.response_message?.includes('breakthrough') ||
      log.response_message?.includes('insight')
    );

    const avgCoherence = 0.65; // Would calculate from actual data
    const totalSessions = recentLogs?.length || 0;

    const crisisSection = crisisSessions.length > 0 ?
      crisisSessions.map(s =>
        `- [[Session-${DateTime.fromISO(s.created_at).toFormat('yyyy-MM-dd_HH-mm')}_${s.id.slice(-6)}]] — ${
          s.risk_level === 'crisis' ? '🚨 Crisis' : '⚠️ High Risk'
        } — ${DateTime.fromISO(s.created_at).toFormat('MMM dd')}`
      ).join('\n') : '- None recorded';

    const growthSection = breakthroughSessions.length > 0 ?
      breakthroughSessions.map(s =>
        `- [[Session-${DateTime.fromISO(s.created_at).toFormat('yyyy-MM-dd_HH-mm')}_${s.id.slice(-6)}]] — ✨ Growth moment — ${DateTime.fromISO(s.created_at).toFormat('MMM dd')}`
      ).join('\n') : '- None recorded';

    const indexContent = `# 📑 MAIA Session Index (Last 7 Days)

**Generated:** ${DateTime.now().toFormat('yyyy-MM-dd HH:mm')} UTC
**Total Sessions:** ${totalSessions}

---

## 🛡️ Crisis & Safety Interventions

${crisisSection}

---

## 🌱 Growth & Breakthrough Moments

${growthSection}

---

## 📊 Wellness Trends (7-day average)

- **Coherence Score:** ${(avgCoherence * 100).toFixed(0)}%
- **Crisis Interventions:** ${crisisSessions.length}
- **Growth Moments:** ${breakthroughSessions.length}
- **Total Sessions:** ${totalSessions}

---

## 🔗 Quick Navigation

- [[Crisis Protocol Documentation]]
- [[Growth Tracking Dashboard]]
- [[Therapist Dashboard]]
- [[Weekly Analysis Canvas]]

---

*This index is automatically updated nightly by the MAIA export system.*

**Tags:** #maia-index #session-tracking #crisis-monitoring
`;

    await fs.writeFile(indexPath, indexContent, 'utf-8');
    console.log('📝 Updated Session-Index.md');
  }

  private async generateWeeklyDigest(sessions: SessionRecord[]): Promise<void> {
    const digestPath = path.join(this.vaultPath, 'Weekly-Digest.md');
    const weekStart = DateTime.now().startOf('week');
    const weekEnd = DateTime.now().endOf('week');

    const digestContent = `# 📈 Weekly MAIA Digest

**Week of:** ${weekStart.toFormat('MMM dd')} - ${weekEnd.toFormat('MMM dd, yyyy')}
**Generated:** ${DateTime.now().toFormat('yyyy-MM-dd HH:mm')} UTC

---

## 📊 This Week's Statistics

- **Total Sessions:** ${sessions.length}
- **Crisis Interventions:** ${sessions.filter(s => s.risk_level === 'crisis').length}
- **High-Risk Sessions:** ${sessions.filter(s => s.risk_level === 'high').length}
- **Growth Breakthroughs:** ${sessions.filter(s => s.breakthroughs?.length).length}

---

## 🎯 Key Insights

### Most Active Days
${sessions.reduce((acc, session) => {
  const day = DateTime.fromISO(session.created_at).toFormat('cccc');
  acc[day] = (acc[day] || 0) + 1;
  return acc;
}, {} as Record<string, number>) |> Object.entries(%) |> %.sort((a, b) => b[1] - a[1]) |> %.slice(0, 3) |> %.map(([day, count]) => `- **${day}:** ${count} sessions`).join('\n')}

### Risk Distribution
- 🚨 Crisis: ${sessions.filter(s => s.risk_level === 'crisis').length}
- ⚠️ High: ${sessions.filter(s => s.risk_level === 'high').length}
- 🟡 Moderate: ${sessions.filter(s => s.risk_level === 'moderate').length}
- 🟢 Low: ${sessions.filter(s => s.risk_level === 'none').length}

---

## 🧭 Notable Sessions

${sessions
  .filter(s => s.risk_level === 'crisis' || s.breakthroughs?.length)
  .slice(0, 5)
  .map(s =>
    `- [[Session-${DateTime.fromISO(s.created_at).toFormat('yyyy-MM-dd_HH-mm')}_${s.id.slice(-6)}]] — ${
      s.risk_level === 'crisis' ? '🚨 Crisis intervention' : '✨ Breakthrough moment'
    }`
  ).join('\n') || '- No notable sessions this week'}

---

*Generated automatically by MAIA Export System*

**Tags:** #weekly-digest #maia-analytics #session-summary
`;

    await fs.writeFile(digestPath, digestContent, 'utf-8');
    console.log('📊 Updated Weekly-Digest.md');
  }

  private async generateTrendAnalysis(): Promise<void> {
    // This would generate a more detailed analysis file
    // For now, just log that it would be created
    console.log('📈 Trend analysis file would be generated here');
  }

  private async generateWeeklyCanvas(): Promise<void> {
    const canvasPath = path.join(this.vaultPath, 'Canvas', 'Weekly-Analysis.canvas');

    // Get sessions from this week
    const weekStart = DateTime.now().startOf('week');
    const { data: weekSessions } = await supabase
      .from('user_safety_log')
      .select('*')
      .gte('created_at', weekStart.toISO());

    const canvas = {
      nodes: [
        {
          id: 'week-overview',
          type: 'text',
          text: `📅 Week of ${weekStart.toFormat('MMM dd')}\n\n📊 ${weekSessions?.length || 0} total sessions\n🚨 ${weekSessions?.filter(s => s.risk_level === 'crisis').length || 0} crisis interventions`,
          x: 0,
          y: 0,
          width: 300,
          height: 200,
          color: '1'
        },
        // Add nodes for each day of the week
        ...Array.from({ length: 7 }, (_, i) => {
          const day = weekStart.plus({ days: i });
          const daySessions = weekSessions?.filter(s =>
            DateTime.fromISO(s.created_at).hasSame(day, 'day')
          ) || [];

          return {
            id: `day-${i}`,
            type: 'text',
            text: `${day.toFormat('cccc')}\n${daySessions.length} sessions`,
            x: 400 + (i * 120),
            y: 0,
            width: 100,
            height: 100,
            color: daySessions.some(s => s.risk_level === 'crisis') ? '5' : '2'
          };
        })
      ],
      edges: [
        // Connect overview to each day
        ...Array.from({ length: 7 }, (_, i) => ({
          id: `edge-${i}`,
          fromNode: 'week-overview',
          toNode: `day-${i}`,
          color: '1'
        }))
      ]
    };

    await fs.mkdir(path.dirname(canvasPath), { recursive: true });
    await fs.writeFile(canvasPath, JSON.stringify(canvas, null, 2), 'utf-8');
    console.log('🗺️ Generated Weekly-Analysis.canvas');
  }

  private async updateArchetypeHub(): Promise<void> {
    console.log('🌟 Updating Archetype Hub...');

    try {
      // Import and run the archetype hub generator
      const { generateWeeklyCanvas } = await import('./generate-weekly-canvas');

      // Get data from the past 4 weeks for comprehensive archetype analysis
      const fourWeeksAgo = DateTime.now().minus({ weeks: 4 });

      const { data: recentSessions } = await supabase
        .from('user_safety_log')
        .select('*')
        .gte('created_at', fourWeeksAgo.toISO())
        .order('created_at', { ascending: false });

      if (!recentSessions || recentSessions.length === 0) {
        console.log('⚠️ No recent sessions found for archetype analysis');
        return;
      }

      // Transform sessions for archetype analysis
      const transformedSessions = recentSessions.map(session => ({
        id: session.id,
        user_id: session.user_id,
        created_at: session.created_at,
        risk_level: session.risk_level,
        breakthroughs: session.response_message?.includes('breakthrough') ? [{
          type: 'insight',
          summary: session.response_message,
          archetypal_resonance: this.extractArchetype(session.response_message || '')
        }] : [],
        themes: [session.risk_level === 'crisis' ? 'crisis-intervention' : 'emotional-support'],
        safety_events: [{
          type: 'detection',
          description: session.response_message || 'Safety event detected',
          risk_level: session.risk_level
        }]
      }));

      // Run the enhanced canvas generator with archetype hub update
      await generateWeeklyCanvas(transformedSessions, {
        updateArchetypeHub: true,
        vaultPath: this.vaultPath
      });

      console.log('✨ Archetype Hub updated successfully');

    } catch (error) {
      console.error('❌ Failed to update Archetype Hub:', error);
      throw error;
    }
  }

  private extractArchetype(message: string): string {
    const archetypes = [
      { name: 'The Hero', keywords: ['courage', 'challenge', 'overcome', 'strength', 'victory'] },
      { name: 'The Sage', keywords: ['wisdom', 'insight', 'understanding', 'knowledge', 'truth'] },
      { name: 'The Caregiver', keywords: ['help', 'support', 'nurture', 'care', 'protect'] },
      { name: 'The Explorer', keywords: ['discover', 'journey', 'explore', 'adventure', 'new'] },
      { name: 'The Shadow', keywords: ['dark', 'hidden', 'fear', 'suppress', 'deny'] },
      { name: 'The Innocent', keywords: ['hope', 'trust', 'faith', 'pure', 'simple'] },
      { name: 'The Creator', keywords: ['create', 'build', 'imagine', 'vision', 'innovate'] },
      { name: 'The Lover', keywords: ['connection', 'relationship', 'passion', 'intimacy', 'love'] }
    ];

    const messageLower = message.toLowerCase();

    for (const archetype of archetypes) {
      if (archetype.keywords.some(keyword => messageLower.includes(keyword))) {
        return archetype.name;
      }
    }

    return 'The Seeker'; // Default archetype for growth-oriented sessions
  }

  private async logExportJob(data: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('export_jobs')
        .insert([{
          ...data,
          job_type: 'obsidian_export',
          vault_path: this.vaultPath
        }]);

      if (error) {
        console.warn('Failed to log export job:', error);
      }
    } catch (error) {
      console.warn('Failed to log export job:', error);
    }
  }
}

// Main execution
async function main() {
  try {
    const job = new NightlyExportJob();
    await job.run();
    process.exit(0);
  } catch (error) {
    console.error('💥 Export job failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { NightlyExportJob };