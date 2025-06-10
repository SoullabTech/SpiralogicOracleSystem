// --- File: frontend/src/lib/api.ts ---

export async function getInsights() {
  // Simulated mock data
  return [
    {
      created_at: "2025-06-07T10:00:00Z",
      detected_phase: "Initiation",
      emotional_intensity: 4,
      keywords: ["vision", "new cycle"]
    },
    {
      created_at: "2025-06-06T14:30:00Z",
      detected_phase: "Transformation",
      emotional_intensity: 5,
      keywords: ["shadow", "breakthrough"]
    },
    {
      created_at: "2025-06-05T09:15:00Z",
      detected_phase: "Grounding",
      emotional_intensity: 2,
      keywords: ["stability", "routine"]
    },
    {
      created_at: "2025-06-04T18:45:00Z",
      detected_phase: "Completion",
      emotional_intensity: 3,
      keywords: ["integration", "peace"]
    }
  ];
}
