// /src/core/SOUL.ts

class SOUL {
    public static adjustTone(userArchetype: string): string {
      switch (userArchetype) {
        case 'Visionary': return 'Inspiring';
        case 'Healer': return 'Soothing';
        case 'Philosopher': return 'Reflective';
        default: return 'Neutral';
      }
    }

    public static adjustContent(userArchetype: string): string {
      switch (userArchetype) {
        case 'Visionary': return 'Here’s a new vision for your future...';
        case 'Healer': return 'Let’s heal and transform together...';
        default: return 'Let’s explore and evolve...';
      }
    }
  }
