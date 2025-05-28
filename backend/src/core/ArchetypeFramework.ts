// /src/core/ArchetypeFramework.ts
class ArchetypeFramework {
    private elements = ['fire', 'water', 'earth', 'air', 'aether'];
  
    constructor(private userProfile: UserProfile) {}
  
    public getArchetype(): string {
      const scores = this.userProfile.elementalScores;
      const dominantElement = this.elements.reduce((prev, curr) =>
        scores[curr] > scores[prev] ? curr : prev
      );
      return this.mapToArchetype(dominantElement);
    }
  
    private mapToArchetype(element: string): string {
      switch (element) {
        case 'fire': return 'Visionary'; 
        case 'water': return 'Healer'; 
        case 'earth': return 'Builder';
        case 'air': return 'Philosopher'; 
        case 'aether': return 'Seeker'; 
        default: return 'Unknown';
      }
    }
  }
  