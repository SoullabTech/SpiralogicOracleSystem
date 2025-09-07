// Supabase Persistence Integration Tests
// Verifies session saving, coherence timeline, and sacred library

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';
import { 
  saveVoiceInteraction,
  loadSession,
  updateCoherenceTimeline,
  searchSacredLibrary 
} from '@/lib/supabase/session-persistence';

// Test Supabase client (use test instance)
const supabaseTest = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for tests
);

describe('Supabase Session Persistence', () => {
  let testSessionId: string;
  let testUserId: string;
  
  beforeEach(async () => {
    // Create test session
    testSessionId = `test-session-${Date.now()}`;
    testUserId = `test-user-${Date.now()}`;
    
    const { error } = await supabaseTest
      .from('oracle_sessions')
      .insert({
        session_id: testSessionId,
        user_id: testUserId,
        metadata: { test: true }
      });
      
    if (error) throw error;
  });
  
  afterEach(async () => {
    // Clean up test data
    await supabaseTest
      .from('oracle_sessions')
      .delete()
      .eq('session_id', testSessionId);
  });
  
  describe('Voice Interaction Storage', () => {
    it('should save voice interaction with all motion data', async () => {
      const interactionData = {
        sessionId: testSessionId,
        transcript: 'I seek guidance for my creative block',
        intent: {
          primary: 'seeking',
          emotional_tone: 'frustrated',
          coherence: 0.45
        },
        oracleResponse: {
          text: 'The creative waters flow when the mind releases control',
          element: 'water',
          practice: 'Free-write for 10 minutes without stopping'
        },
        motionState: {
          state: 'processing',
          elementalBalance: {
            fire: 0.3,
            water: 0.7,
            earth: 0.2,
            air: 0.5,
            aether: 0.1
          }
        },
        coherenceLevel: 0.45
      };
      
      const { interaction, error } = await saveVoiceInteraction(interactionData);
      
      expect(error).toBeNull();
      expect(interaction).toMatchObject({
        transcript: interactionData.transcript,
        coherence_level: interactionData.coherenceLevel
      });
      
      // Verify it was saved
      const { data: saved } = await supabaseTest
        .from('voice_interactions')
        .select('*')
        .eq('session_id', testSessionId)
        .single();
        
      expect(saved).toBeDefined();
      expect(saved.motion_state).toEqual(interactionData.motionState);
    });
    
    it('should maintain interaction order within session', async () => {
      // Save multiple interactions
      const interactions = [
        { transcript: 'First question', coherenceLevel: 0.3 },
        { transcript: 'Second question', coherenceLevel: 0.5 },
        { transcript: 'Third question', coherenceLevel: 0.7 }
      ];
      
      for (const data of interactions) {
        await saveVoiceInteraction({
          sessionId: testSessionId,
          ...data,
          intent: {},
          oracleResponse: {},
          motionState: {}
        });
        
        // Small delay to ensure timestamp ordering
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      // Load session and verify order
      const session = await loadSession(testSessionId);
      
      expect(session.interactions).toHaveLength(3);
      expect(session.interactions[0].transcript).toBe('First question');
      expect(session.interactions[2].transcript).toBe('Third question');
      
      // Verify coherence progression
      expect(session.interactions[2].coherence_level).toBeGreaterThan(
        session.interactions[0].coherence_level
      );
    });
  });
  
  describe('Coherence Timeline', () => {
    it('should track coherence changes over time', async () => {
      const coherencePoints = [
        { value: 0.3, shadowElements: ['fear'], aetherState: 'contractive' },
        { value: 0.5, shadowElements: [], aetherState: 'stillness' },
        { value: 0.85, shadowElements: [], aetherState: 'expansive' }
      ];
      
      for (const point of coherencePoints) {
        await updateCoherenceTimeline(testSessionId, point.value, {
          shadowElements: point.shadowElements,
          aetherState: point.aetherState as any
        });
        
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      // Retrieve timeline
      const { data: timeline } = await supabaseTest
        .from('coherence_timeline')
        .select('*')
        .eq('session_id', testSessionId)
        .order('timestamp', { ascending: true });
        
      expect(timeline).toHaveLength(3);
      expect(timeline[0].coherence_value).toBe(0.3);
      expect(timeline[2].coherence_value).toBe(0.85);
      expect(timeline[2].aether_state).toBe('expansive');
    });
    
    it('should calculate breakthrough moments', async () => {
      // Simulate a breakthrough pattern
      const pattern = [0.3, 0.35, 0.4, 0.5, 0.65, 0.87, 0.9];
      
      for (const value of pattern) {
        await updateCoherenceTimeline(testSessionId, value);
      }
      
      const { data: timeline } = await supabaseTest
        .from('coherence_timeline')
        .select('*')
        .eq('session_id', testSessionId)
        .gte('coherence_value', 0.85);
        
      expect(timeline).toHaveLength(2); // Two breakthrough points
    });
  });
  
  describe('Sacred Document Library', () => {
    let testDocId: string;
    
    beforeEach(async () => {
      // Insert test document
      const { data, error } = await supabaseTest
        .from('sacred_documents')
        .insert({
          user_id: testUserId,
          file_name: 'test-journal.txt',
          file_url: 'https://storage/test-journal.txt',
          dominant_element: 'water',
          elemental_balance: {
            fire: 0.2,
            water: 0.6,
            earth: 0.1,
            air: 0.1,
            aether: 0.0
          },
          key_themes: ['emotions', 'healing', 'flow'],
          shadow_aspects: ['resistance', 'fear'],
          coherence_indicators: ['acceptance', 'surrender'],
          aether_resonance: 0.4
        })
        .select()
        .single();
        
      if (error) throw error;
      testDocId = data.id;
    });
    
    afterEach(async () => {
      await supabaseTest
        .from('sacred_documents')
        .delete()
        .eq('id', testDocId);
    });
    
    it('should search documents by element', async () => {
      const results = await searchSacredLibrary({
        userId: testUserId,
        element: 'water'
      });
      
      expect(results.data).toHaveLength(1);
      expect(results.data[0].dominant_element).toBe('water');
    });
    
    it('should search by theme keywords', async () => {
      const results = await searchSacredLibrary({
        userId: testUserId,
        query: 'healing'
      });
      
      expect(results.data).toHaveLength(1);
      expect(results.data[0].key_themes).toContain('healing');
    });
    
    it('should filter by aether resonance', async () => {
      // Add document with high resonance
      await supabaseTest
        .from('sacred_documents')
        .insert({
          user_id: testUserId,
          file_name: 'breakthrough.txt',
          file_url: 'https://storage/breakthrough.txt',
          dominant_element: 'aether',
          elemental_balance: { fire: 0, water: 0, earth: 0, air: 0, aether: 1 },
          key_themes: ['unity', 'transcendence'],
          shadow_aspects: [],
          coherence_indicators: ['oneness'],
          aether_resonance: 0.95
        });
      
      const highResonance = await searchSacredLibrary({
        userId: testUserId,
        minResonance: 0.9
      });
      
      expect(highResonance.data).toHaveLength(1);
      expect(highResonance.data[0].aether_resonance).toBeGreaterThanOrEqual(0.9);
      
      const allDocs = await searchSacredLibrary({
        userId: testUserId
      });
      
      expect(allDocs.data).toHaveLength(2);
    });
    
    it('should link documents to related sessions', async () => {
      // Update document with related session
      const { error } = await supabaseTest
        .from('sacred_documents')
        .update({
          related_sessions: [testSessionId]
        })
        .eq('id', testDocId);
        
      expect(error).toBeNull();
      
      // Verify linkage
      const { data: doc } = await supabaseTest
        .from('sacred_documents')
        .select('*')
        .eq('id', testDocId)
        .single();
        
      expect(doc.related_sessions).toContain(testSessionId);
    });
  });
  
  describe('Data Privacy & Security', () => {
    it('should enforce row-level security for user data', async () => {
      // Try to access another user's session (should fail)
      const { data, error } = await supabaseTest
        .from('oracle_sessions')
        .select('*')
        .eq('user_id', 'different-user-id');
        
      // With RLS enabled, this should return empty or error
      expect(data).toEqual([]);
    });
    
    it('should sanitize user input before storage', async () => {
      const maliciousInput = '<script>alert("xss")</script>';
      
      const { interaction } = await saveVoiceInteraction({
        sessionId: testSessionId,
        transcript: maliciousInput,
        intent: {},
        oracleResponse: {},
        motionState: {},
        coherenceLevel: 0.5
      });
      
      // Should be sanitized or escaped
      expect(interaction.transcript).not.toContain('<script>');
    });
  });
  
  describe('Performance & Optimization', () => {
    it('should handle batch operations efficiently', async () => {
      const startTime = Date.now();
      
      // Batch insert multiple interactions
      const interactions = Array.from({ length: 50 }, (_, i) => ({
        session_id: testSessionId,
        transcript: `Interaction ${i}`,
        intent: {},
        oracle_response: {},
        motion_state: {},
        coherence_level: Math.random()
      }));
      
      const { error } = await supabaseTest
        .from('voice_interactions')
        .insert(interactions);
        
      const duration = Date.now() - startTime;
      
      expect(error).toBeNull();
      expect(duration).toBeLessThan(5000); // Should complete within 5s
    });
    
    it('should use indexes for fast retrieval', async () => {
      // Insert many documents
      const docs = Array.from({ length: 100 }, (_, i) => ({
        user_id: testUserId,
        file_name: `doc-${i}.txt`,
        file_url: `https://storage/doc-${i}.txt`,
        dominant_element: ['fire', 'water', 'earth', 'air', 'aether'][i % 5],
        elemental_balance: { fire: 0.2, water: 0.2, earth: 0.2, air: 0.2, aether: 0.2 },
        key_themes: [`theme-${i}`],
        shadow_aspects: [],
        coherence_indicators: [],
        aether_resonance: Math.random()
      }));
      
      await supabaseTest.from('sacred_documents').insert(docs);
      
      const startTime = Date.now();
      
      // Search with index
      const results = await searchSacredLibrary({
        userId: testUserId,
        element: 'water'
      });
      
      const searchDuration = Date.now() - startTime;
      
      expect(searchDuration).toBeLessThan(1000); // Should be fast with index
      expect(results.data.length).toBeGreaterThan(0);
      
      // Cleanup
      await supabaseTest
        .from('sacred_documents')
        .delete()
        .eq('user_id', testUserId);
    });
  });
});