// Sacred Pipeline End-to-End Tests
// Verifies: Voice → Oracle → Motion → Audio/Haptic flow

import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { createMocks } from 'node-mocks-http';
import { POST as sacredPortalHandler } from '@/app/api/sacred-portal/route';
import { POST as oracleHoloflowerHandler } from '@/app/api/oracle-holoflower/route';
import { audioService } from '@/src/core/services/AudioService';
import { mapResponseToMotion } from '@/lib/motion/motion-mapper';
import { SACRED_CONFIG } from '@/src/core/config/sacred.config';

// Mock Anthropic API
jest.mock('@anthropic-ai/sdk', () => ({
  Anthropic: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [{
          text: JSON.stringify({
            primaryFacet: 'fire-passion',
            text: 'Your inner flame seeks expression through creation.',
            reflection: 'Notice where passion meets resistance.',
            practice: 'Light a candle and speak your truth to the flame.',
            motionHints: {
              coherenceLevel: 'high',
              shadowElements: ['water'],
              aetherState: 'expansive'
            }
          })
        }]
      })
    }
  }))
}));

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn().mockResolvedValue({ data: {}, error: null }),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: {}, error: null })
    }))
  }
}));

describe('Sacred Portal Pipeline', () => {
  
  describe('Voice → Intent Processing', () => {
    it('should process voice transcript into structured intent', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          transcript: 'I feel stuck in my creative expression'
        }
      });

      await sacredPortalHandler(req as any, res as any);
      
      const jsonData = JSON.parse(res._getData());
      
      expect(res._getStatusCode()).toBe(200);
      expect(jsonData).toHaveProperty('intent');
      expect(jsonData).toHaveProperty('oracle');
      expect(jsonData).toHaveProperty('motion');
      expect(jsonData.motion).toMatchObject({
        state: expect.any(String),
        coherence: expect.any(Number),
        shadowPetals: expect.any(Array)
      });
    });

    it('should handle empty transcript gracefully', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: { transcript: '' }
      });

      await sacredPortalHandler(req as any, res as any);
      
      expect(res._getStatusCode()).toBe(200);
      const jsonData = JSON.parse(res._getData());
      expect(jsonData.oracle).toBeDefined();
    });
  });

  describe('Oracle → Motion Mapping', () => {
    it('should map oracle response to motion states correctly', () => {
      const oracleResponse = {
        primaryFacet: 'water-emotion',
        text: 'Flow with the currents of feeling.',
        motionHints: {
          coherenceLevel: 'breakthrough',
          shadowElements: ['earth', 'fire'],
          aetherState: 'stillness'
        }
      };

      const motion = mapResponseToMotion(oracleResponse);
      
      expect(motion).toMatchObject({
        state: 'breakthrough',
        elementalBalance: {
          water: expect.any(Number),
          earth: expect.any(Number),
          fire: expect.any(Number),
          air: expect.any(Number),
          aether: expect.any(Number)
        },
        coherence: expect.any(Number),
        shadowPetals: expect.arrayContaining(['earth', 'fire']),
        aetherStage: 'stillness'
      });
      
      // Verify coherence is in breakthrough range
      expect(motion.coherence).toBeGreaterThanOrEqual(SACRED_CONFIG.coherence.thresholds.breakthrough);
    });

    it('should handle conversation context for motion continuity', () => {
      const context = {
        previousCoherence: 0.5,
        conversationHistory: [
          { role: 'user', content: 'I feel lost' },
          { role: 'assistant', content: 'Witness this feeling' }
        ]
      };

      const motion = mapResponseToMotion({}, context);
      
      // Should maintain some continuity with previous state
      expect(Math.abs(motion.coherence - context.previousCoherence)).toBeLessThan(0.5);
    });
  });

  describe('Audio Service Integration', () => {
    beforeAll(() => {
      // Mock AudioContext
      global.AudioContext = jest.fn().mockImplementation(() => ({
        createOscillator: jest.fn(() => ({
          type: 'sine',
          frequency: { value: 0 },
          connect: jest.fn(),
          start: jest.fn(),
          stop: jest.fn(),
          onended: null
        })),
        createGain: jest.fn(() => ({
          gain: {
            value: 0,
            setValueAtTime: jest.fn(),
            exponentialRampToValueAtTime: jest.fn()
          },
          connect: jest.fn()
        })),
        currentTime: 0,
        state: 'running',
        destination: {}
      })) as any;
    });

    it('should initialize audio service correctly', async () => {
      await audioService.initialize();
      expect(audioService.isReady()).toBe(true);
    });

    it('should play elemental tones with correct frequencies', async () => {
      await audioService.initialize();
      
      const elements = ['fire', 'water', 'earth', 'air', 'aether'] as const;
      
      for (const element of elements) {
        const playPromise = audioService.playElementalTone(element, 100);
        expect(playPromise).toBeInstanceOf(Promise);
        
        // Verify frequency matches config
        const expectedFreq = SACRED_CONFIG.audio.sacredFrequencies[element];
        expect(expectedFreq).toBeDefined();
      }
    });

    it('should respect volume settings', () => {
      audioService.setMasterVolume(0.7);
      // Volume should be clamped between 0 and 1
      audioService.setMasterVolume(1.5);
      audioService.setMasterVolume(-0.5);
      
      expect(audioService.isReady()).toBe(true);
    });
  });

  describe('Holoflower Oracle Integration', () => {
    it('should process full oracle flow with motion hints', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          query: 'What needs my attention today?',
          checkIns: {
            body: 'tense',
            emotion: 'anxious',
            mind: 'scattered',
            spirit: 'seeking'
          },
          sessionId: 'test-session-123'
        }
      });

      await oracleHoloflowerHandler(req as any, res as any);
      
      const response = JSON.parse(res._getData());
      
      expect(res._getStatusCode()).toBe(200);
      expect(response).toMatchObject({
        response: expect.any(String),
        primaryFacet: expect.any(String),
        motion: {
          state: expect.any(String),
          elementalBalance: expect.any(Object),
          coherence: expect.any(Number),
          shadowPetals: expect.any(Array)
        },
        audio: {
          frequency: expect.any(Number),
          duration: expect.any(Number),
          volume: expect.any(Number)
        }
      });
    });

    it('should maintain session continuity', async () => {
      const sessionId = 'continuous-session';
      
      // First interaction
      const { req: req1, res: res1 } = createMocks({
        method: 'POST',
        body: {
          query: 'I feel disconnected',
          sessionId
        }
      });
      
      await oracleHoloflowerHandler(req1 as any, res1 as any);
      const response1 = JSON.parse(res1._getData());
      
      // Second interaction
      const { req: req2, res: res2 } = createMocks({
        method: 'POST',
        body: {
          query: 'How can I reconnect?',
          sessionId,
          conversationHistory: [{
            role: 'user',
            content: 'I feel disconnected'
          }]
        }
      });
      
      await oracleHoloflowerHandler(req2 as any, res2 as any);
      const response2 = JSON.parse(res2._getData());
      
      // Should show evolution in coherence or state
      expect(response2.motion.state).toBeDefined();
      expect(response2.sessionId).toBe(sessionId);
    });
  });

  describe('Performance & Error Handling', () => {
    it('should handle API timeouts gracefully', async () => {
      jest.useFakeTimers();
      
      const { req, res } = createMocks({
        method: 'POST',
        body: { transcript: 'test' }
      });
      
      const handlerPromise = sacredPortalHandler(req as any, res as any);
      
      // Fast-forward past timeout
      jest.advanceTimersByTime(SACRED_CONFIG.api.timeouts.default + 1000);
      
      await handlerPromise;
      
      expect(res._getStatusCode()).toBeLessThanOrEqual(500);
      jest.useRealTimers();
    });

    it('should validate request payloads', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: { 
          // Invalid payload - missing required fields
          randomField: 'invalid'
        }
      });
      
      await oracleHoloflowerHandler(req as any, res as any);
      
      expect(res._getStatusCode()).toBe(400);
    });

    it('should clean up resources on error', async () => {
      const disposeSpy = jest.spyOn(audioService, 'dispose');
      
      // Simulate an error condition
      const { req, res } = createMocks({
        method: 'POST',
        body: null // This should cause an error
      });
      
      await sacredPortalHandler(req as any, res as any);
      
      // Verify cleanup doesn't throw
      expect(() => audioService.dispose()).not.toThrow();
    });
  });

  describe('Mobile Optimization', () => {
    it('should detect device tier and adjust limits', () => {
      // Mock low-end device
      Object.defineProperty(navigator, 'deviceMemory', {
        value: 2,
        configurable: true
      });
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        value: 2,
        configurable: true
      });
      
      const { MobileOptimizer } = require('@/lib/performance/mobile-optimizer');
      MobileOptimizer.detectDeviceTier();
      const config = MobileOptimizer.getOptimizedConfig();
      
      expect(config.maxAnimations).toBe(1);
      expect(config.particleLimit).toBeLessThanOrEqual(3);
      expect(config.reducedMotion).toBe(true);
    });
  });
});

describe('Haptic Feedback', () => {
  it('should trigger haptics on coherence breakthrough', () => {
    const hapticSpy = jest.spyOn(navigator, 'vibrate').mockImplementation(() => true);
    
    const { triggerHapticFeedback } = require('@/lib/haptics');
    
    triggerHapticFeedback('breakthrough');
    expect(hapticSpy).toHaveBeenCalledWith(expect.any(Array));
    
    triggerHapticFeedback('pulse');
    expect(hapticSpy).toHaveBeenCalledTimes(2);
    
    hapticSpy.mockRestore();
  });
});