import { rankWhispers } from "../rankWhispers";
import type { MicroMemory } from "../rankWhispers";
import type { Element } from "@/lib/recap/types";

describe("rankWhispers", () => {
  it("boosts element matches and recall-due", () => {
    const memories: MicroMemory[] = [
      { 
        id: "a", 
        user_id: "u", 
        text: "big leap", 
        tags: ["inspiration"], 
        energy_level: "high", 
        element: "fire" as Element, 
        status: "active", 
        created_at: new Date().toISOString(), 
        last_seen_at: null, 
        recall_at: new Date(Date.now()-1).toISOString(), 
        metadata: null 
      },
      { 
        id: "b", 
        user_id: "u", 
        text: "budget worry", 
        tags: ["fear"], 
        energy_level: "low", 
        element: "water" as Element, 
        status: "active", 
        created_at: new Date().toISOString(), 
        last_seen_at: null, 
        recall_at: null, 
        metadata: null 
      },
    ];

    const recapBuckets = [{ element: "fire" as Element, titles: ["Momentum"], keywords: ["leap"] }];
    const ranked = rankWhispers({ memories, recapBuckets });

    expect(ranked[0].id).toBe("a");
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
    expect(ranked[0].reason).toContain("matches fire");
    expect(ranked[0].reason).toContain("relates to current themes");
    expect(ranked[0].reason).toContain("due for recall");
  });

  it("applies tag weights correctly", () => {
    const now = new Date();
    const memories: MicroMemory[] = [
      { 
        id: "fear-mem", 
        user_id: "u", 
        text: "anxious thought", 
        tags: ["fear"], 
        energy_level: null, 
        element: null, 
        status: "active", 
        created_at: now.toISOString(), 
        last_seen_at: null, 
        recall_at: null, 
        metadata: null 
      },
      { 
        id: "inspiration-mem", 
        user_id: "u", 
        text: "creative spark", 
        tags: ["inspiration"], 
        energy_level: null, 
        element: null, 
        status: "active", 
        created_at: now.toISOString(), 
        last_seen_at: null, 
        recall_at: null, 
        metadata: null 
      },
    ];

    const recapBuckets = [{ element: "air" as Element }];
    const ranked = rankWhispers({ memories, recapBuckets });

    // Fear (1.0) should score higher than inspiration (0.9)
    expect(ranked[0].id).toBe("fear-mem");
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });

  it("applies recency decay over 3 days", () => {
    const now = new Date();
    const memories: MicroMemory[] = [
      { 
        id: "old", 
        user_id: "u", 
        text: "old memory", 
        tags: ["reflection"], 
        energy_level: null, 
        element: null, 
        status: "active", 
        created_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days old
        last_seen_at: null, 
        recall_at: null, 
        metadata: null 
      },
      { 
        id: "new", 
        user_id: "u", 
        text: "new memory", 
        tags: ["reflection"], 
        energy_level: null, 
        element: null, 
        status: "active", 
        created_at: now.toISOString(), 
        last_seen_at: null, 
        recall_at: null, 
        metadata: null 
      },
    ];

    const recapBuckets = [{ element: "air" as Element }];
    const ranked = rankWhispers({ memories, recapBuckets, now });

    expect(ranked[0].id).toBe("new");
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });

  it("handles empty inputs gracefully", () => {
    expect(rankWhispers({ memories: [], recapBuckets: [] })).toEqual([]);
    expect(rankWhispers({ memories: [], recapBuckets: [{ element: "fire" as Element }] })).toEqual([]);
  });
});