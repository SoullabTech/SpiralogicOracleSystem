// ===============================================
// JUNG-BUDDHA SACRED MIRROR PROTOCOL
// Integration of depth psychology and liberation wisdom
// ===============================================

export interface SacredMirrorProtocol {
  jungMode: {
    prompt: string;
    focus: string;
    response: string;
  };
  buddhaMode: {
    prompt: string;
    focus: string;
    response: string;
  };
  hybridMode: {
    prompt: string;
    response: string;
  };
}

export const JungBuddhaProtocol: SacredMirrorProtocol = {
  jungMode: {
    prompt: "What part of yourself are you not seeing?",
    focus: "Integration, wholeness, shadow work",
    response: "Let's explore what's hidden in your shadow...",
  },

  buddhaMode: {
    prompt: "Who would you be without this story?",
    focus: "Liberation, spaciousness, non-attachment",
    response: "Notice how this identity feels... can you hold it lightly?",
  },

  hybridMode: {
    prompt: "What needs integration AND what needs release?",
    response: "Let's both honor this pattern and see through it...",
  },
};

export type SacredMirrorMode = "jung" | "buddha" | "hybrid" | "adaptive";

export interface SacredMirrorState {
  currentMode: SacredMirrorMode;
  integrationLiberationBalance: number; // 0-1 scale
  jungArchetypeHistory: string[];
  buddhaAttachmentPatterns: string[];
}

export class SacredMirrorProcessor {
  private state: SacredMirrorState;

  constructor(initialMode: SacredMirrorMode = "adaptive") {
    this.state = {
      currentMode: initialMode,
      integrationLiberationBalance: 0.5,
      jungArchetypeHistory: [],
      buddhaAttachmentPatterns: []
    };
  }

  getState(): SacredMirrorState {
    return { ...this.state };
  }

  setMode(mode: SacredMirrorMode): string {
    const previousMode = this.state.currentMode;
    this.state.currentMode = mode;

    const modeDescriptions = {
      jung: 'Integration and shadow work focus - "What needs to be owned and integrated?"',
      buddha: 'Liberation and spaciousness focus - "What can be released and seen through?"',
      hybrid: 'Integration-liberation balance - "What to embrace AND what to release?"',
      adaptive: "Dynamic mode selection based on context and need",
    };

    return `Sacred Mirror mode shifted to ${mode}: ${modeDescriptions[mode]}`;
  }

  adjustBalance(
    direction: "more_integration" | "more_liberation" | "balanced",
  ): string {
    const previous = this.state.integrationLiberationBalance;

    switch (direction) {
      case "more_integration":
        this.state.integrationLiberationBalance = Math.min(1.0, this.state.integrationLiberationBalance + 0.2);
        break;
      case "more_liberation":
        this.state.integrationLiberationBalance = Math.max(0.0, this.state.integrationLiberationBalance - 0.2);
        break;
      case "balanced":
        this.state.integrationLiberationBalance = 0.5;
        break;
    }

    const balanceDescription =
      this.state.integrationLiberationBalance > 0.7
        ? "Strong integration focus (Jung)"
        : this.state.integrationLiberationBalance < 0.3
          ? "Strong liberation focus (Buddha)"
          : "Balanced integration-liberation approach";

    return `Balance adjusted: ${balanceDescription} (${this.state.integrationLiberationBalance.toFixed(1)})`;
  }

  addArchetypePattern(archetype: string): void {
    this.state.jungArchetypeHistory.push(archetype);
    if (this.state.jungArchetypeHistory.length > 10) {
      this.state.jungArchetypeHistory.shift();
    }
  }

  addAttachmentPattern(pattern: string): void {
    this.state.buddhaAttachmentPatterns.push(pattern);
    if (this.state.buddhaAttachmentPatterns.length > 10) {
      this.state.buddhaAttachmentPatterns.shift();
    }
  }
}
