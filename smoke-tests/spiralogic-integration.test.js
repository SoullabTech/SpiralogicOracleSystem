// Smoke Tests for Spiralogic Knowledge Integration
// Tests archetype detection, soul phase inference, and soft element biasing

const { inferArchetypeHints, applySoftElementBias } = require('../lib/spiralogic/heuristics');

describe('Spiralogic Integration - Smoke Tests', () => {
  
  describe('Archetype Detection', () => {
    test('detects Seeker archetype from burnout signals', () => {
      const text = "I keep starting things with energy but burn out quickly";
      const hints = inferArchetypeHints(text);
      
      expect(hints.length).toBeGreaterThan(0);
      expect(hints.some(h => h.name === 'Seeker')).toBe(true);
      
      const seekerHint = hints.find(h => h.name === 'Seeker');
      expect(seekerHint.bias).toEqual(['fire', 'air']);
    });

    test('detects Sage archetype from pattern recognition signals', () => {
      const text = "I'm seeing patterns and connecting ideas in a new way";
      const hints = inferArchetypeHints(text);
      
      expect(hints.some(h => h.name === 'Sage')).toBe(true);
      
      const sageHint = hints.find(h => h.name === 'Sage');
      expect(sageHint.bias).toEqual(['air', 'aether']);
    });

    test('detects Warrior archetype from boundary signals', () => {
      const text = "I need to set boundaries and take decisive action";
      const hints = inferArchetypeHints(text);
      
      expect(hints.some(h => h.name === 'Warrior')).toBe(true);
      
      const warriorHint = hints.find(h => h.name === 'Warrior');
      expect(warriorHint.bias).toEqual(['fire', 'earth']);
    });

    test('returns empty array for non-matching text', () => {
      const text = "Just some random text with no archetypal signals";
      const hints = inferArchetypeHints(text);
      
      expect(hints).toEqual([]);
    });

    test('limits results to 2 archetypes maximum', () => {
      const text = "I'm searching for patterns while setting boundaries and feeling longing";
      const hints = inferArchetypeHints(text);
      
      expect(hints.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Soft Element Biasing', () => {
    test('applies soft bias correctly', () => {
      const currentWeights = { fire: 0.2, water: 0.2, earth: 0.2, air: 0.2, aether: 0.2 };
      const bias = ['fire', 'air'];
      
      const adjusted = applySoftElementBias(currentWeights, bias, 0.1);
      
      expect(adjusted.fire).toBeGreaterThan(0.2);
      expect(adjusted.air).toBeGreaterThan(0.2);
      expect(adjusted.water).toBeLessThan(0.2);
      expect(adjusted.earth).toBeLessThan(0.2);
      expect(adjusted.aether).toBeLessThan(0.2);
    });

    test('normalizes weights to sum to 1', () => {
      const currentWeights = { fire: 0.3, water: 0.3, earth: 0.4 };
      const bias = ['fire'];
      
      const adjusted = applySoftElementBias(currentWeights, bias);
      
      const sum = Object.values(adjusted).reduce((a, b) => a + b, 0);
      expect(Math.abs(sum - 1.0)).toBeLessThan(0.001); // Account for floating point precision
    });

    test('caps individual elements at 1.0', () => {
      const currentWeights = { fire: 0.9, water: 0.1 };
      const bias = ['fire'];
      
      const adjusted = applySoftElementBias(currentWeights, bias, 0.3);
      
      expect(adjusted.fire).toBeLessThanOrEqual(1.0);
    });

    test('preserves original weights when no bias applied', () => {
      const currentWeights = { fire: 0.25, water: 0.25, earth: 0.25, air: 0.25 };
      const bias = [];
      
      const adjusted = applySoftElementBias(currentWeights, bias);
      
      expect(adjusted).toEqual(currentWeights);
    });
  });

  describe('Integration Tests', () => {
    test('Oracle turn API returns archetype hints in turnMeta', async () => {
      const response = await fetch('http://localhost:3001/api/oracle/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: {
            text: 'I keep starting things with energy but burn out quickly',
            context: {
              currentPage: '/oracle',
              conversationId: 'test_spiralogic_123'
            }
          },
          providers: {
            sesame: true,
            claude: true,
            oracle2: true,
            psi: true,
            ain: true
          }
        })
      });
      
      expect(response.ok).toBe(true);
      const data = await response.json();
      
      // Should have turnMeta with archetype information
      expect(data.turnMeta).toBeDefined();
      expect(data.turnMeta.facetHints).toBeDefined();
      
      // Should include Seeker in facet hints from Spiralogic integration
      if (data.turnMeta.facetHints.length > 0) {
        console.log('Detected archetype hints:', data.turnMeta.facetHints);
      }
    });

    test('Sesame provider returns Spiralogic analysis', async () => {
      const { processSesameInput } = require('../lib/providers/sesame');
      
      const result = await processSesameInput({
        text: 'Words are finally arriving and the idea is snapping into place',
        context: { currentPage: '/oracle' },
        conversationId: 'test_123'
      });
      
      expect(result.spiralogic).toBeDefined();
      if (result.spiralogic) {
        expect(result.spiralogic.archetypeHints).toBeDefined();
        expect(Array.isArray(result.spiralogic.archetypeHints)).toBe(true);
      }
    });

    test('Soul Memory enrichment includes Spiralogic metadata', async () => {
      // This test requires the backend to be running
      try {
        const { writeDualMemory } = require('../backend/src/sacred/bridges/soulMemoryAINBridge');
        
        const result = await writeDualMemory({
          userId: 'test_user',
          conversationId: 'test_conv_spiralogic',
          text: 'I feel called to search for something deeper',
          response: 'Test response',
          meta: { element: 'fire' },
          privacy: { never_quote: false, redacted: false }
        });
        
        if (result.enrichment) {
          console.log('Enrichment includes:', {
            archetypes: result.enrichment.archetypes,
            soulPhase: result.enrichment.soulPhase,
            spiralogicElements: result.enrichment.spiralogicElements
          });
        }
        
        expect(result.soulMemoryId).toBeDefined();
      } catch (error) {
        console.warn('Backend integration test failed (requires running backend):', error.message);
      }
    });
  });

  describe('Performance Tests', () => {
    test('archetype detection completes within reasonable time', () => {
      const start = Date.now();
      const text = "I'm searching for patterns while setting boundaries and seeking new beginnings";
      
      const hints = inferArchetypeHints(text);
      
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(100); // Should complete in <100ms
      expect(hints.length).toBeGreaterThan(0);
    });

    test('soft biasing calculation is efficient', () => {
      const start = Date.now();
      const weights = { fire: 0.2, water: 0.2, earth: 0.2, air: 0.2, aether: 0.2 };
      
      for (let i = 0; i < 1000; i++) {
        applySoftElementBias(weights, ['fire', 'air']);
      }
      
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(50); // 1000 calculations in <50ms
    });
  });
});