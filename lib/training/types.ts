// Request from turn pipeline to evaluator
export interface TrainingEvaluateRequest {
  agent: "claude" | "sacred" | "micropsi";
  user_hash: string;                 // salted user id
  conv_id?: string;
  prompt_summary: string;            // redacted/abstracted
  response_summary: string;          // redacted/abstracted
  context_meta?: {
    drives?: Partial<Record<"clarity"|"safety"|"agency"|"connection"|"meaning", number>>;
    facets?: Record<string, number>; // top facets only
    micropsi?: { arousal?: number; valence?: number; meaning?: number };
  };
  session_id?: string;               // optional current training session
}

// Evaluator response (stored in training_* tables)
export interface TrainingEvaluateResponse {
  interaction_id: string;
  score: {
    attunement: number;
    clarity: number;
    warmth: number;
    depth: number;
    ethics: number;
    conversationality: number;
    total: number;                   // 0..1
  };
  feedback?: {
    keep?: string[];
    improve?: string[];
    exemplars?: string[];
  };
  meta?: {
    model_version?: string;
    eval_ms?: number;
    tokens_input?: number;
    tokens_output?: number;
    access_level?: number;           // 1..5
    violation?: boolean;
    policy?: string;
  };
}

// Admin metrics payload for the dashboard
export interface AdminTrainingMetrics {
  throughput: { sampled_1h: number; sampled_24h: number };
  quality: {
    avg_total_24h: number;
    dims: {
      attunement: number; clarity: number; warmth: number;
      depth: number; ethics: number; conversationality: number;
    };
  };
  agents: Array<{ agent: string; avg_total: number; n: number; delta24h?: number }>;
  guardrails: { violations_24h: number; access_level_avg: number };
  updated_at: string;
}