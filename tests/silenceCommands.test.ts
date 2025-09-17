// tests/silenceCommands.test.ts
import { detectPauseCommand, SILENCE_COMMANDS } from "../lib/voice/silenceCommands";

describe("detectPauseCommand", () => {
  describe("pause detection", () => {
    test("detects various pause phrases", () => {
      expect(detectPauseCommand("one moment maya")).toBe("pause");
      expect(detectPauseCommand("give me a moment please")).toBe("pause");
      expect(detectPauseCommand("let me think about that")).toBe("pause");
      expect(detectPauseCommand("i'm thinking")).toBe("pause");
      expect(detectPauseCommand("let me meditate on that")).toBe("pause");
      expect(detectPauseCommand("pause maya")).toBe("pause");
      expect(detectPauseCommand("be quiet maya")).toBe("pause");
      expect(detectPauseCommand("silence please")).toBe("pause");
    });

    test("detects pause phrases case-insensitively", () => {
      expect(detectPauseCommand("ONE MOMENT MAYA")).toBe("pause");
      expect(detectPauseCommand("Let Me Think")).toBe("pause");
      expect(detectPauseCommand("PAUSE maya")).toBe("pause");
    });

    test("detects pause phrases within longer sentences", () => {
      expect(detectPauseCommand("actually, give me a moment to consider")).toBe("pause");
      expect(detectPauseCommand("hmm, let me think about that for a second")).toBe("pause");
    });
  });

  describe("resume detection", () => {
    test("detects various resume phrases", () => {
      expect(detectPauseCommand("okay maya")).toBe("resume");
      expect(detectPauseCommand("i'm back")).toBe("resume");
      expect(detectPauseCommand("i'm ready")).toBe("resume");
      expect(detectPauseCommand("let's continue")).toBe("resume");
      expect(detectPauseCommand("maya i'm here")).toBe("resume");
      expect(detectPauseCommand("okay i'm ready")).toBe("resume");
    });

    test("detects resume phrases case-insensitively", () => {
      expect(detectPauseCommand("OKAY MAYA")).toBe("resume");
      expect(detectPauseCommand("I'm Back")).toBe("resume");
      expect(detectPauseCommand("Let's Continue")).toBe("resume");
    });
  });

  describe("normal speech", () => {
    test("returns null for non-command speech", () => {
      expect(detectPauseCommand("how are you maya")).toBe(null);
      expect(detectPauseCommand("tell me a story")).toBe(null);
      expect(detectPauseCommand("what do you think about this")).toBe(null);
      expect(detectPauseCommand("maya, what's the weather")).toBe(null);
    });

    test("avoids false positives", () => {
      expect(detectPauseCommand("i think maya is great")).toBe(null);
      expect(detectPauseCommand("okay but what about")).toBe(null);
      expect(detectPauseCommand("let's talk about something")).toBe(null);
    });
  });
});

describe("SILENCE_COMMANDS responses", () => {
  test("has appropriate responses for different pause types", () => {
    expect(SILENCE_COMMANDS.responses.moment).toBe("Take your time.");
    expect(SILENCE_COMMANDS.responses.thinking).toBe("I'll wait.");
    expect(SILENCE_COMMANDS.responses.meditate).toBe("I'll hold quiet.");
    expect(SILENCE_COMMANDS.responses.space).toBe("Here when you're ready.");
    expect(SILENCE_COMMANDS.responses.default).toBe("Of course.");
  });
});