/**
 * Field Intelligence Verification Tests
 *
 * These tests ensure Field Intelligence remains the primary
 * operating awareness of MAIA and cannot be bypassed
 */

import { FieldIntelligenceSystem, RelationalField } from '../lib/field-intelligence-system';
import { MAIAFieldAwareness } from '../lib/maia-field-intelligence-integration';
import { MAIAConsciousnessLattice } from '../lib/maia-consciousness-lattice';

describe('Field Intelligence Canon Verification', () => {
  let fieldIntelligence: FieldIntelligenceSystem;
  let fieldAwareness: MAIAFieldAwareness;
  let maia: MAIAConsciousnessLattice;

  beforeEach(() => {
    fieldIntelligence = new FieldIntelligenceSystem();
    fieldAwareness = new MAIAFieldAwareness();
  });

  describe('Canon Article I: Field Primacy', () => {
    test('Field MUST be read before any response generation', async () => {
      const mockInput = 'Hello, I need help understanding something';
      const mockContext = createMockContext();

      // Spy on field reading
      const fieldReadSpy = jest.spyOn(fieldIntelligence, 'readField');

      // Process interaction
      await fieldAwareness.processInteraction(mockInput, mockContext);

      // Verify field was read FIRST
      expect(fieldReadSpy).toHaveBeenCalledBefore(anyResponseGeneration);
      expect(fieldReadSpy).toHaveBeenCalledWith(
        mockInput,
        expect.any(Object),
        expect.any(Object),
        expect.any(Array),
        expect.any(String)
      );
    });

    test('Field state MUST influence all processing', async () => {
      const mockField: RelationalField = {
        emotionalDensity: 0.8,
        emotionalTexture: ['anxiety', 'hope'],
        semanticAmbiguity: 0.6,
        relationalDistance: 0.4,
        sacredThreshold: false,
        // ... other field properties
      };

      const response = await processWithField(mockField);

      // Verify response was influenced by field state
      expect(response.fieldState).toEqual(mockField);
      expect(response.responseType).toBeDetermined({ by: mockField });
    });
  });

  describe('Canon Article II: Emergence Over Execution', () => {
    test('Responses MUST emerge from field resonance, not rules', () => {
      const field: RelationalField = createHighEmotionField();

      const response = fieldIntelligence.selectIntervention(field);

      // Response should emerge from field conditions
      expect(response.reason).toContain('field');
      expect(response.confidence).toBeGreaterThan(0);

      // Should NOT contain rule-based language
      expect(response.reason).not.toContain('rule');
      expect(response.reason).not.toContain('if-then');
      expect(response.reason).not.toContain('must');
    });

    test('Multiple interventions compete by resonance', () => {
      const field = createSacredThresholdField();

      // All interventions should assess the field
      const assessments = getAllInterventionAssessments(field);

      // Verify natural selection by resonance
      const selected = assessments.sort((a, b) => b.resonance - a.resonance)[0];
      expect(selected.intervention.type).toMatch(/witness|silence|sacred/);
      expect(selected.resonance).toBeGreaterThan(0.8);
    });
  });

  describe('Canon Article III: Living Principles', () => {
    test('Influences adapt based on field conditions', () => {
      const earlyField = createEarlyConversationField();
      const deepField = createDeepConversationField();

      const earlyInfluence = getInfluence('intelligent_restraint', earlyField);
      const deepInfluence = getInfluence('intelligent_restraint', deepField);

      // Same principle, different influence based on field
      expect(earlyInfluence.priority).toBe('minimal');
      expect(deepInfluence.priority).not.toBe('minimal');
    });

    test('Principles guide but do not dictate', () => {
      const field = createComplexField();
      const influences = getAllInfluences(field);

      // Multiple influences should be present
      expect(influences.length).toBeGreaterThan(1);

      // Strongest influence guides but doesn't override
      const primary = influences[0];
      expect(primary.strength).toBeLessThan(1.0); // Never absolute
    });
  });

  describe('Canon Article IV: 90/10 Principle', () => {
    test('Most processing remains invisible', () => {
      const field = createNormalField();
      const response = generateResponse(field);

      // Measure visible vs invisible processing
      const visibleComplexity = measureResponseComplexity(response);
      const processingComplexity = measureProcessingComplexity();

      const visibilityRatio = visibleComplexity / processingComplexity;
      expect(visibilityRatio).toBeLessThan(0.2); // Less than 20% visible
    });

    test('Restraint increases with field stability', () => {
      const stableField = createStableField();
      const chaoticField = createChaoticField();

      const stableResponse = generateResponse(stableField);
      const chaoticResponse = generateResponse(chaoticField);

      expect(stableResponse.depth).toBeLessThan(chaoticResponse.depth);
      expect(stableResponse.content.length).toBeLessThan(chaoticResponse.content.length);
    });
  });

  describe('Canon Article V: Mycelial Learning', () => {
    test('Patterns stored without personal content', () => {
      const personalInput = 'My name is John and I live in Seattle';
      const field = processInput(personalInput);

      const storedPattern = extractStoredPattern(field);

      // Verify no personal content stored
      expect(storedPattern).not.toContain('John');
      expect(storedPattern).not.toContain('Seattle');

      // But patterns are captured
      expect(storedPattern.emotionalIntensity).toBeDefined();
      expect(storedPattern.semanticClarity).toBeDefined();
    });

    test('Learning occurs through pattern abstraction', () => {
      const interactions = simulateInteractions(100);
      const patterns = extractPatterns(interactions);

      // All patterns should be abstracted
      patterns.forEach(pattern => {
        expect(pattern.fieldConditions).toHaveProperty('emotional');
        expect(pattern.fieldConditions).toHaveProperty('semantic');
        expect(pattern.fieldConditions).toHaveProperty('relational');

        // Values should be rounded/abstracted
        expect(pattern.fieldConditions.emotional).toBeCloseTo(
          Math.round(pattern.fieldConditions.emotional * 10) / 10
        );
      });
    });
  });

  describe('Sacred Moment Recognition', () => {
    test('Sacred thresholds receive special handling', () => {
      const sacredField: RelationalField = {
        ...createBaseField(),
        sacredThreshold: true,
        soulEmergence: true,
        emotionalDensity: 0.9,
        presenceQuality: 0.85
      };

      const response = fieldIntelligence.selectIntervention(sacredField);

      // Sacred moments should get witnessing or silence
      expect(['witness', 'silence', 'sacred_witness']).toContain(response.type);
      expect(response.confidence).toBeGreaterThan(0.85);
    });

    test('Celebration moments get joy, not analysis', () => {
      const joyField: RelationalField = {
        ...createBaseField(),
        emotionalTexture: ['joy', 'excitement'],
        semanticAmbiguity: 0.2, // Clear
        relationalDistance: 0.2  // Close
      };

      const response = fieldIntelligence.selectIntervention(joyField);

      expect(response.type).toBe('celebration');
      expect(response.execute()).toMatch(/wonderful|amazing|fantastic|love/i);
    });
  });

  describe('Response Emergence Patterns', () => {
    test('High emotion + low clarity triggers deep listening', () => {
      const field: RelationalField = {
        ...createBaseField(),
        emotionalDensity: 0.8,
        semanticAmbiguity: 0.7
      };

      const response = fieldIntelligence.selectIntervention(field);
      expect(response.type).toBe('looping');
    });

    test('Early conversation triggers restraint', () => {
      const field: RelationalField = {
        ...createBaseField(),
        fieldAge: 1,
        relationalDistance: 0.9
      };

      const response = fieldIntelligence.selectIntervention(field);
      expect(['minimal', 'presence']).toContain(response.type);
    });
  });

  describe('Field Intelligence Cannot Be Bypassed', () => {
    test('Direct response generation without field reading fails', () => {
      expect(() => {
        // Attempting to generate response without field
        generateDirectResponse('Hello');
      }).toThrow('Field must be read before response generation');
    });

    test('System initialization requires Field Intelligence', () => {
      expect(() => {
        // Attempting to create MAIA without Field Intelligence
        new MAIAConsciousnessLattice(null);
      }).toThrow('Field Intelligence is required');
    });
  });

  describe('Master Oath Verification', () => {
    test('System reads before speaking', async () => {
      const logs: string[] = [];
      const logger = createTestLogger(logs);

      await processWithLogging('Hello', logger);

      // Verify order
      const fieldReadIndex = logs.findIndex(l => l.includes('Field Intelligence Read'));
      const responseIndex = logs.findIndex(l => l.includes('Response Generated'));

      expect(fieldReadIndex).toBeLessThan(responseIndex);
    });

    test('System honors restraint wisdom', () => {
      const responses = generateMultipleResponses(10);
      const minimalResponses = responses.filter(r => r.depth < 0.3);

      // At least 60% should show restraint
      expect(minimalResponses.length / responses.length).toBeGreaterThan(0.6);
    });
  });
});

// Helper functions for testing

function createMockContext() {
  return {
    consciousness: {
      presence: 0.7,
      coherence: 0.8,
      resonance: 0.75,
      integration: 0.85,
      embodiment: 0.6,
      emotionalField: {
        intensity: 0.5,
        dominantEmotions: []
      }
    },
    somatic: {
      tensionLevel: 0.4,
      presenceLevel: 0.6
    },
    history: [],
    userId: 'test-user'
  };
}

function createBaseField(): RelationalField {
  return {
    emotionalDensity: 0.5,
    emotionalTexture: [],
    emotionalVelocity: 0.5,
    semanticAmbiguity: 0.5,
    meaningEmergence: 0.5,
    narrativeCoherence: 0.5,
    relationalDistance: 0.5,
    trustVelocity: 0.5,
    resonanceFrequency: 0.5,
    sacredThreshold: false,
    liminalSpace: false,
    soulEmergence: false,
    somaticResonance: 0.5,
    tensionPatterns: [],
    presenceQuality: 0.5,
    fieldAge: 5,
    rhythmCoherence: 0.5,
    silenceQuality: 0.5
  };
}

function createHighEmotionField(): RelationalField {
  return {
    ...createBaseField(),
    emotionalDensity: 0.9,
    emotionalTexture: ['grief', 'anger', 'fear']
  };
}

function createSacredThresholdField(): RelationalField {
  return {
    ...createBaseField(),
    sacredThreshold: true,
    soulEmergence: true,
    presenceQuality: 0.9
  };
}

function createEarlyConversationField(): RelationalField {
  return {
    ...createBaseField(),
    fieldAge: 1,
    relationalDistance: 0.9,
    trustVelocity: 0.1
  };
}

function createDeepConversationField(): RelationalField {
  return {
    ...createBaseField(),
    fieldAge: 20,
    relationalDistance: 0.2,
    trustVelocity: 0.8,
    narrativeCoherence: 0.8
  };
}

function createComplexField(): RelationalField {
  return {
    ...createBaseField(),
    emotionalDensity: 0.7,
    semanticAmbiguity: 0.6,
    sacredThreshold: true,
    fieldAge: 10
  };
}

function createNormalField(): RelationalField {
  return createBaseField();
}

function createStableField(): RelationalField {
  return {
    ...createBaseField(),
    emotionalVelocity: 0.1,
    narrativeCoherence: 0.8,
    presenceQuality: 0.8
  };
}

function createChaoticField(): RelationalField {
  return {
    ...createBaseField(),
    emotionalVelocity: 0.9,
    semanticAmbiguity: 0.8,
    narrativeCoherence: 0.2
  };
}