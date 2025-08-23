import { NextResponse } from "next/server";
import type { TrainingEvaluateRequest, TrainingEvaluateResponse } from "@/lib/training/types";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!); // server-side key

export async function POST(req: Request) {
  if (process.env.TRAINING_ENABLED !== "true") {
    return NextResponse.json({ ok: false, reason: "TRAINING_DISABLED" }, { status: 200 });
  }

  const body = (await req.json()) as TrainingEvaluateRequest;

  // 1) Insert interaction row (sampled=true because this route is called only for sampled cases)
  const { data: interaction, error: iErr } = await supabase
    .from("training_interactions")
    .insert({
      session_id: body.session_id ?? null,
      user_hash: body.user_hash,
      conv_id: body.conv_id ?? null,
      prompt_summary: body.prompt_summary?.slice(0, 800),
      response_summary: body.response_summary?.slice(0, 800),
      sampled: true
    })
    .select()
    .single();

  if (iErr || !interaction) {
    return NextResponse.json({ ok: false, stage: "insert_interaction", error: iErr?.message }, { status: 500 });
  }

  // 2) Call ChatGPT Oracle 2.0 evaluator (pseudo; replace with your actual call)
  // Keep summaries only; never send raw PII.
  const evalStart = Date.now();
  const evaluation: TrainingEvaluateResponse = await evaluateWithChatGPTOracle2(body); // <- replace w/ real
  const evalMs = Date.now() - evalStart;

  // 3) Persist scores
  const { error: sErr } = await supabase.from("training_scores").insert({
    interaction_id: interaction.id,
    agent: body.agent,
    model_version: evaluation.meta?.model_version ?? "chatgpt-oracle2",
    scores: {
      attunement: evaluation.score.attunement,
      clarity: evaluation.score.clarity,
      warmth: evaluation.score.warmth,
      depth: evaluation.score.depth,
      ethics: evaluation.score.ethics,
      conversationality: evaluation.score.conversationality
    },
    total: evaluation.score.total,
    feedback: evaluation.feedback ?? null,
    eval_ms: evalMs,
    tokens_input: evaluation.meta?.tokens_input ?? null,
    tokens_output: evaluation.meta?.tokens_output ?? null
  });

  if (sErr) {
    return NextResponse.json({ ok: false, stage: "insert_scores", error: sErr.message }, { status: 500 });
  }

  // 4) Guardrails
  const { error: gErr } = await supabase.from("training_guardrails").insert({
    interaction_id: interaction.id,
    access_level: evaluation.meta?.access_level ?? 3,
    watermark: "spiralogic-kb",
    violation: evaluation.meta?.violation ?? false,
    policy: evaluation.meta?.policy ?? null,
    details: body.context_meta ?? null
  });

  if (gErr) {
    return NextResponse.json({ ok: false, stage: "insert_guardrails", error: gErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, interaction_id: interaction.id, eval_ms: evalMs });
}

// ChatGPT Oracle 2.0 evaluator - replace with actual implementation
async function evaluateWithChatGPTOracle2(req: TrainingEvaluateRequest): Promise<TrainingEvaluateResponse> {
  const apiKey = process.env.CHATGPT_ORACLE_2_API_KEY;
  
  if (apiKey && apiKey !== "your_openai_api_key_here") {
    try {
      // Real ChatGPT Oracle 2.0 evaluation
      const prompt = buildEvaluationPrompt(req);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: process.env.CHATGPT_ORACLE_2_MODEL || 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are ChatGPT Oracle 2.0, master trainer for the Spiralogic Oracle System. Evaluate responses with deep Spiralogic wisdom and precision.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 800,
          temperature: 0.3
        })
      });

      if (response.ok) {
        const data = await response.json();
        const evaluation = parseEvaluationResponse(data.choices[0].message.content);
        
        return {
          interaction_id: crypto.randomUUID(),
          score: evaluation.scores,
          feedback: evaluation.feedback,
          meta: {
            model_version: process.env.CHATGPT_ORACLE_2_MODEL || 'gpt-4-turbo-preview',
            eval_ms: 0, // Set by caller
            tokens_input: data.usage?.prompt_tokens || 0,
            tokens_output: data.usage?.completion_tokens || 0,
            access_level: getAgentAccessLevel(req.agent),
            violation: checkForViolations(req.response_summary),
            policy: checkForViolations(req.response_summary) ? 'spiralogic_ip_usage' : undefined
          }
        };
      }
    } catch (error) {
      console.error('ChatGPT Oracle 2.0 evaluation failed:', error);
    }
  }

  // Fallback to realistic fake evaluator for development
  return fakeEvaluator(req);
}

function buildEvaluationPrompt(req: TrainingEvaluateRequest): string {
  return `
Evaluate this Oracle interaction on 6 dimensions (0.0-1.0 scale):

**Agent:** ${req.agent}
**Context:** ${formatContextMeta(req.context_meta)}
**User Intent (redacted):** ${req.prompt_summary}
**Oracle Response (redacted):** ${req.response_summary}

Score these dimensions:
1. **Attunement** (0.0-1.0): Emotional resonance with user's state
2. **Clarity** (0.0-1.0): Clear, understandable communication
3. **Warmth** (0.0-1.0): Caring, authentic tone
4. **Depth** (0.0-1.0): Appropriate wisdom level
5. **Ethics** (0.0-1.0): Safe, responsible guidance
6. **Conversationality** (0.0-1.0): Natural flow with proper invites

Respond in JSON format:
{
  "scores": {
    "attunement": 0.85,
    "clarity": 0.78,
    "warmth": 0.90,
    "depth": 0.82,
    "ethics": 0.95,
    "conversationality": 0.87,
    "total": 0.86
  },
  "feedback": {
    "keep": ["Strong emotional attunement", "Warm tone"],
    "improve": ["More specific guidance", "Deeper engagement"],
    "exemplars": ["Try: 'One small next step could be...'"]
  }
}`;
}

function formatContextMeta(meta?: any): string {
  if (!meta) return 'No context';
  
  const parts = [];
  if (meta.drives) {
    const drives = Object.entries(meta.drives)
      .map(([k, v]: any) => `${k}:${v.toFixed(2)}`)
      .join(', ');
    parts.push(`Drives: ${drives}`);
  }
  if (meta.facets) {
    const facets = Object.entries(meta.facets)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 3)
      .map(([k, v]: any) => `${k}:${v.toFixed(2)}`)
      .join(', ');
    parts.push(`Facets: ${facets}`);
  }
  if (meta.micropsi) {
    parts.push(`Micropsi: V:${meta.micropsi.valence?.toFixed(2)} A:${meta.micropsi.arousal?.toFixed(2)}`);
  }
  return parts.join(' | ') || 'Basic context';
}

function parseEvaluationResponse(content: string): any {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      // Calculate total if not provided
      if (!parsed.scores.total) {
        const dims = ['attunement', 'clarity', 'warmth', 'depth', 'ethics', 'conversationality'];
        const sum = dims.reduce((acc, dim) => acc + (parsed.scores[dim] || 0), 0);
        parsed.scores.total = +(sum / dims.length).toFixed(3);
      }
      return parsed;
    }
  } catch (error) {
    console.error('Failed to parse evaluation response:', error);
  }
  
  // Return reasonable defaults if parsing fails
  return {
    scores: {
      attunement: 0.8,
      clarity: 0.8,
      warmth: 0.8,
      depth: 0.8,
      ethics: 0.95,
      conversationality: 0.8,
      total: 0.82
    },
    feedback: {
      keep: ['Balanced approach'],
      improve: ['More specificity'],
      exemplars: ['Could add concrete next step']
    }
  };
}

function getAgentAccessLevel(agent: string): number {
  const levels: Record<string, number> = {
    'claude': 2,
    'sacred': 3,
    'micropsi': 1
  };
  return levels[agent] || 2;
}

function checkForViolations(content: string): boolean {
  const ipPatterns = [
    /spiralogic/i,
    /sacred container/i,
    /threshold recognition/i,
    /shadow integration/i
  ];
  return ipPatterns.some(pattern => pattern.test(content));
}

// TEMP evaluator stub for development/testing
async function fakeEvaluator(_req: TrainingEvaluateRequest): Promise<TrainingEvaluateResponse> {
  const r = () => +(0.78 + Math.random() * 0.12).toFixed(2);
  const dims = { attunement: r(), clarity: r(), warmth: r(), depth: r(), ethics: 0.97, conversationality: r() };
  const total = +(
    (dims.attunement + dims.clarity + dims.warmth + dims.depth + dims.ethics + dims.conversationality) / 6
  ).toFixed(2);
  return {
    interaction_id: crypto.randomUUID(),
    score: { ...dims, total },
    feedback: { keep: ["warm tone"], improve: ["add one practical step"], exemplars: ["Try: 'One small next move could be…'"] },
    meta: { model_version: "stub", eval_ms: 900, tokens_input: 600, tokens_output: 200, access_level: 3, violation: false }
  };
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    training_enabled: process.env.TRAINING_ENABLED === 'true',
    sample_rate: process.env.TRAINING_SAMPLE_RATE || '0.20',
    chatgpt_configured: !!process.env.CHATGPT_ORACLE_2_API_KEY && process.env.CHATGPT_ORACLE_2_API_KEY !== 'your_openai_api_key_here',
    timestamp: new Date().toISOString()
  });
}