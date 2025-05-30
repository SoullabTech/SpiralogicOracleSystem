"use strict";
// /src/core/HumanPacedLearning.ts
class HumanPacedLearning {
    constructor() {
        this.requiredReflectionTime = 60000; // 1 minute
        this.userEngaged = false;
        this.lastInteractionTime = new Date();
    }
    trackEngagement(activity) {
        if (activity === 'engage') {
            this.userEngaged = true;
            this.lastInteractionTime = new Date();
        }
    }
    isReadyToProgress() {
        const timeElapsed = new Date().getTime() - this.lastInteractionTime.getTime();
        return timeElapsed > this.requiredReflectionTime;
    }
    pauseForReflection() {
        this.userEngaged = false;
    }
}
