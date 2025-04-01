import { supabase } from './supabase';
import { oracleAI } from './oracle';

interface Session {
  id: string;
  client_id: string;
  element?: string;
  phase?: string;
  created_at: string;
  ended_at?: string;
  summary?: string;
  insights: any[];
  patterns: any[];
  growth_indicators: any[];
}

interface ChatMessage {
  id: string;
  session_id: string;
  content: string;
  sender: 'client' | 'oracle' | 'system';
  element?: string;
  insight_type?: string;
  created_at: string;
}

interface ClientProfile {
  id: string;
  name: string;
  element?: string;
  phase?: string;
  archetype?: string;
  guidance_mode?: string;
  preferred_tone?: string;
}

interface SessionSummary {
  id: string;
  session_id: string;
  content: string;
  element?: string;
  phase?: string;
  created_at: string;
}

export class SessionSummaryManager {
  async generateSessionSummary(clientId: string, sessionId: string): Promise<SessionSummary | null> {
    try {
      // Fetch session messages
      const { data: messages, error: messageError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
        
      if (messageError) throw new Error(`Error fetching messages: ${messageError.message}`);
      if (!messages || messages.length === 0) return null;
      
      // Get client profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', clientId)
        .single();
        
      if (profileError) throw new Error(`Error fetching profile: ${profileError.message}`);
      
      // Prepare conversation transcript
      const transcript = messages.map(msg => 
        `${msg.sender === 'client' ? 'Client' : 'Oracle'}: ${msg.content}`
      ).join('\n\n');
      
      // Get session data
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
        
      if (sessionError) throw new Error(`Error fetching session: ${sessionError.message}`);
      
      // Build context for AI analysis
      const elementalContext = `Client's current element is ${profile.element || 'unknown'} and they are in the ${profile.phase || 'unknown'} phase.`;
      
      const summaryPrompt = `
        Below is a transcript from an Oracle 3.0 mentoring session. 
        ${elementalContext}
        
        Please analyze this conversation and create a structured summary including:
        1. Key insights (maximum 3)
        2. Primary themes discussed
        3. Elemental patterns observed
        4. Suggested next focus area
        5. Growth indicators
        
        Format the summary in a way that honors the client's current element (${profile.element || 'unknown'}).
        
        TRANSCRIPT:
        ${transcript}
      `;
      
      // Get AI response
      const response = await oracleAI.respond(clientId, summaryPrompt, {
        client_name: profile.name,
        element: profile.element,
        phase: profile.phase,
        archetype: profile.archetype
      });
      
      // Extract insights and patterns
      const insights = extractInsights(response.result);
      const patterns = extractPatterns(response.result);
      const growthIndicators = extractGrowthIndicators(response.result);
      
      // Update session with analysis
      const { error: updateError } = await supabase
        .from('sessions')
        .update({
          summary: response.result,
          insights,
          patterns,
          growth_indicators: growthIndicators,
          ended_at: session.ended_at || new Date().toISOString()
        })
        .eq('id', sessionId);
        
      if (updateError) throw new Error(`Error updating session: ${updateError.message}`);
      
      // Store summary
      const { data: summaryData, error: summaryError } = await supabase
        .from('session_summaries')
        .insert({
          session_id: sessionId,
          content: response.result,
          element: response.analysis.element,
          phase: profile.phase,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (summaryError) throw new Error(`Error storing summary: ${summaryError.message}`);
      
      return summaryData;
    } catch (error) {
      console.error('Error generating session summary:', error);
      throw error;
    }
  }
  
  async getClientSummaries(clientId: string, limit = 10): Promise<SessionSummary[]> {
    try {
      const { data, error } = await supabase
        .from('session_summaries')
        .select(`
          id,
          session_id,
          content,
          element,
          phase,
          created_at,
          sessions!inner (
            client_id
          )
        `)
        .eq('sessions.client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (error) throw new Error(`Error fetching summaries: ${error.message}`);
      
      return data || [];
    } catch (error) {
      console.error('Error fetching session summaries:', error);
      throw error;
    }
  }
  
  async getSessionSummary(sessionId: string): Promise<SessionSummary | null> {
    try {
      const { data, error } = await supabase
        .from('session_summaries')
        .select('*')
        .eq('session_id', sessionId)
        .single();
        
      if (error && error.code !== 'PGRST116') throw new Error(`Error fetching summary: ${error.message}`);
      
      return data;
    } catch (error) {
      console.error('Error fetching session summary:', error);
      throw error;
    }
  }
}

// Helper functions to extract structured data from AI response
function extractInsights(content: string): string[] {
  const insights: string[] = [];
  const lines = content.split('\n');
  
  let insightSection = false;
  for (const line of lines) {
    if (line.toLowerCase().includes('key insights:')) {
      insightSection = true;
      continue;
    }
    
    if (insightSection && line.trim()) {
      if (line.match(/^\d+\./)) {
        insights.push(line.replace(/^\d+\./, '').trim());
      }
    }
    
    if (insightSection && insights.length >= 3) break;
  }
  
  return insights;
}

function extractPatterns(content: string): string[] {
  const patterns: string[] = [];
  const lines = content.split('\n');
  
  let patternSection = false;
  for (const line of lines) {
    if (line.toLowerCase().includes('patterns observed:') || 
        line.toLowerCase().includes('elemental patterns:')) {
      patternSection = true;
      continue;
    }
    
    if (patternSection && line.trim()) {
      if (line.match(/^[-•*]/) || line.match(/^\d+\./)) {
        patterns.push(line.replace(/^[-•*]\s*/, '').replace(/^\d+\./, '').trim());
      }
    }
    
    if (patternSection && patterns.length >= 3) break;
  }
  
  return patterns;
}

function extractGrowthIndicators(content: string): string[] {
  const indicators: string[] = [];
  const lines = content.split('\n');
  
  let indicatorSection = false;
  for (const line of lines) {
    if (line.toLowerCase().includes('growth indicators:')) {
      indicatorSection = true;
      continue;
    }
    
    if (indicatorSection && line.trim()) {
      if (line.match(/^[-•*]/) || line.match(/^\d+\./)) {
        indicators.push(line.replace(/^[-•*]\s*/, '').replace(/^\d+\./, '').trim());
      }
    }
    
    if (indicatorSection && indicators.length >= 3) break;
  }
  
  return indicators;
}

// Export singleton instance
export const sessionSummaryManager = new SessionSummaryManager();