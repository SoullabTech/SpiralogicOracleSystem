// /src/core/HumanPacedLearning.ts
class HumanPacedLearning {
    private lastInteractionTime: Date;
    private requiredReflectionTime: number = 60000; // 1 minute
    private userEngaged: boolean = false;
  
    constructor() {
      this.lastInteractionTime = new Date();
    }
  
    public trackEngagement(activity: string): void {
      if (activity === 'engage') {
        this.userEngaged = true;
        this.lastInteractionTime = new Date();
      }
    }
  
    public isReadyToProgress(): boolean {
      const timeElapsed = new Date().getTime() - this.lastInteractionTime.getTime();
      return timeElapsed > this.requiredReflectionTime;
    }
  
    public pauseForReflection(): void {
      this.userEngaged = false;
    }
  }
  