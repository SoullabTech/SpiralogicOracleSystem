import { OpenAI } from 'openai';
import { extractSymbolsFromText } from '../lib/extractSymbols';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface OracleInterpretationRequest {
  input: string;
  symbols?: string[];
}

interface OracleInterpretationResponse {
  interpretation: string;
  archetype: string;
  phase: string;
}

export async function getOracleInterpretation({
  input,
  symbols = [],
}: OracleInterpretationRequest): Promise<OracleInterpretationResponse> {
  const resolvedSymbols =
    symbols.length > 0 ? symbols : await extractSymbolsFromText(input);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content:
          'You are a dream oracle. Respond ONLY with a valid JSON object that includes: interpretation, archetype, and spiral phase. Avoid prose. Example:\n' +
          `{ "interpretation": "Your dream of flying symbolizes liberation.", "archetype": "Mystic", "phase": "Water 3 – Transcendence & Surrender" }`,
      },
      {
        role: 'user',
        content: `Interpret the dream symbolically: "${input}". Symbols: ${resolvedSymbols.join(', ')}`,
      },
    ],
    temperature: 0.85,
  });

  const content = completion.choices[0].message.content;

  if (!content) throw new Error('No response from Oracle');

  try {
    const parsed = JSON.parse(content);
    if (!parsed.interpretation || !parsed.archetype || !parsed.phase) {
      throw new Error('Incomplete Oracle response');
    }
    return parsed;
  } catch (err) {
    console.error('❌ Failed to parse Oracle response:', content);
    throw new Error('Invalid Oracle response JSON');
  }
}
