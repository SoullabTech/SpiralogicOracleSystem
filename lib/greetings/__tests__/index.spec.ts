// Greeting System Tests
// Tests for greeting selection, rotation, and auto-tone detection

import { pickGreeting, resetGreetingRotation, shouldGreetFirstTurn } from '../index';

describe('Greeting System', () => {
  beforeEach(() => {
    resetGreetingRotation();
    // Set test environment
    process.env.MAYA_DEFAULT_NAME_FALLBACK = 'friend';
    process.env.MAYA_GREETING_TONE = 'auto';
  });

  afterEach(() => {
    delete process.env.MAYA_DEFAULT_NAME_FALLBACK;
    delete process.env.MAYA_GREETING_TONE;
  });

  describe('pickGreeting', () => {
    it('should pick from default bucket by default', () => {
      const greeting = pickGreeting({ name: 'Test' });
      expect(greeting).toContain('Test');
      expect(greeting).toMatch(/^(Hey|Hi|What's up|Welcome)/);
    });

    it('should handle auto tone with seeker archetype', () => {
      const greeting = pickGreeting({
        name: 'Kelly',
        tone: 'auto',
        archetypeHint: 'seeker'
      });
      expect(greeting).toContain('Kelly');
      expect(greeting).toMatch(/(curiosity|questions|seeking|wondering)/i);
    });

    it('should handle auto tone with warrior archetype', () => {
      const greeting = pickGreeting({
        name: 'Sam',
        tone: 'auto',
        archetypeHint: 'warrior'
      });
      expect(greeting).toContain('Sam');
      expect(greeting).toMatch(/(courage|strength|stand|ready|sharp)/i);
    });

    it('should detect threshold indicators', () => {
      const greeting = pickGreeting({
        name: 'Alex',
        tone: 'auto',
        soulPhase: 'new beginning transition',
        userInput: 'I feel like I'm on the edge of something changing'
      });
      expect(greeting).toContain('Alex');
      expect(greeting).toMatch(/(edge|change|threshold|shift|crossing)/i);
    });

    it('should use warm tone for negative sentiment', () => {
      const greeting = pickGreeting({
        name: 'Jordan',
        tone: 'auto',
        sentiment: 'negative'
      });
      expect(greeting).toContain('Jordan');
      expect(greeting).toMatch(/(breath|place|ease|listening)/i);
    });

    it('should fallback to default name', () => {
      const greeting = pickGreeting({});
      expect(greeting).toContain('friend');
    });
  });

  describe('rotation logic', () => {
    it('should not repeat greetings more than 3 times in 10 runs', () => {
      const greetings = new Set<string>();
      
      for (let i = 0; i < 10; i++) {
        const greeting = pickGreeting({
          name: 'Test',
          tone: 'default'
        });
        greetings.add(greeting);
      }
      
      // Should have at least 3 different greetings in 10 runs
      expect(greetings.size).toBeGreaterThanOrEqual(3);
    });

    it('should reset when all greetings are used', () => {
      const name = 'TestUser';
      const tone = 'default';
      const usedGreetings = new Set<string>();
      
      // Exhaust all greetings (assuming 5 default greetings)
      for (let i = 0; i < 10; i++) {
        const greeting = pickGreeting({ name, tone });
        usedGreetings.add(greeting);
      }
      
      // Should have cycled through and reused some
      expect(usedGreetings.size).toBeLessThanOrEqual(5);
    });
  });

  describe('name substitution', () => {
    it('should replace {name} placeholder correctly', () => {
      const greeting = pickGreeting({ name: 'TestName' });
      expect(greeting).toContain('TestName');
      expect(greeting).not.toContain('{name}');
    });

    it('should handle special characters in names', () => {
      const greeting = pickGreeting({ name: "O'Connor" });
      expect(greeting).toContain("O'Connor");
    });
  });

  describe('shouldGreetFirstTurn', () => {
    it('should return true for new conversation flag', () => {
      const result = shouldGreetFirstTurn({ isNewConversation: true });
      expect(result).toBe(true);
    });

    it('should return true for zero message count', () => {
      const result = shouldGreetFirstTurn({ messageCount: 0 });
      expect(result).toBe(true);
    });

    it('should return true for first message', () => {
      const result = shouldGreetFirstTurn({ messageCount: 1 });
      expect(result).toBe(true);
    });

    it('should return false for multiple messages', () => {
      const result = shouldGreetFirstTurn({ messageCount: 3 });
      expect(result).toBe(false);
    });

    it('should return true for zero theme exchanges', () => {
      const result = shouldGreetFirstTurn({ themeExchangeCount: 0 });
      expect(result).toBe(true);
    });

    it('should return false for multiple theme exchanges', () => {
      const result = shouldGreetFirstTurn({ themeExchangeCount: 2 });
      expect(result).toBe(false);
    });

    it('should return true for recent conversation ID', () => {
      const now = Date.now();
      const result = shouldGreetFirstTurn({ 
        conversationId: `conv_${now}_abc123` 
      });
      expect(result).toBe(true);
    });

    it('should return false for old conversation ID', () => {
      const oldTime = Date.now() - 60000; // 1 minute ago
      const result = shouldGreetFirstTurn({ 
        conversationId: `conv_${oldTime}_abc123` 
      });
      expect(result).toBe(false);
    });

    it('should default to true for safety', () => {
      const result = shouldGreetFirstTurn({});
      expect(result).toBe(true);
    });
  });

  describe('auto-tone selection', () => {
    const archetypeTests = [
      { archetype: 'seeker', expectedTone: 'seeker' },
      { archetype: 'explorer', expectedTone: 'seeker' },
      { archetype: 'warrior', expectedTone: 'warrior' },
      { archetype: 'challenger', expectedTone: 'warrior' },
      { archetype: 'mystic', expectedTone: 'mystic' },
      { archetype: 'sage', expectedTone: 'mystic' },
      { archetype: 'casual', expectedTone: 'casual-wise' }
    ];

    archetypeTests.forEach(({ archetype, expectedTone }) => {
      it(`should map ${archetype} to ${expectedTone} tone`, () => {
        const greeting = pickGreeting({
          name: 'Test',
          tone: 'auto',
          archetypeHint: archetype
        });
        
        // Verify the greeting content matches expected tone
        const greetingLower = greeting.toLowerCase();
        switch (expectedTone) {
          case 'seeker':
            expect(greetingLower).toMatch(/(curiosity|questions|reaching|seeker|wondering)/);
            break;
          case 'warrior':
            expect(greetingLower).toMatch(/(courage|strength|edge|ready|sharp)/);
            break;
          case 'mystic':
            expect(greetingLower).toMatch(/(undercurrent|subtle|mystery|stillness|beneath)/);
            break;
          case 'casual-wise':
            expect(greetingLower).toMatch(/(yo|stirring|headline|real stuff|lay it)/);
            break;
        }
      });
    });

    it('should detect threshold keywords in soul phase', () => {
      const thresholdKeywords = ['new', 'change', 'transition', 'shift', 'threshold'];
      
      thresholdKeywords.forEach(keyword => {
        const greeting = pickGreeting({
          name: 'Test',
          tone: 'auto',
          soulPhase: `A time of ${keyword} and growth`
        });
        
        expect(greeting.toLowerCase()).toMatch(/(edge|change|shift|crossing|threshold)/);
      });
    });

    it('should detect threshold keywords in user input', () => {
      const greeting = pickGreeting({
        name: 'Test',
        tone: 'auto',
        userInput: 'I feel like I\'m beginning a new chapter in my life'
      });
      
      expect(greeting.toLowerCase()).toMatch(/(edge|change|shift|crossing|threshold)/);
    });
  });
});