import express from "express";
import { z } from "zod";
import { supabase } from "../../lib/supabase";
import { extractSymbolsFromText } from "../../lib/extractSymbols";
import { getOracleInterpretation } from "../../services/oracleService";

const router = express.Router();

const dreamSchema = z.object({
  userId: z.string(),
  dreamDescription: z.string(),
  context: z
    .object({
      symbols: z.array(z.string()).optional(),
    })
    .optional(),
});

router.post("/dream/query", async (req, res) => {
  try {
    const parsed = dreamSchema.parse(req.body);
    const { userId, dreamDescription, context } = parsed;

    const symbols = context?.symbols?.length
      ? context.symbols
      : await extractSymbolsFromText(dreamDescription);

    const result = await getOracleInterpretation({
      input: dreamDescription,
      symbols,
    });

    const { interpretation, phase, archetype } = result;

    const { error: dbError } = await supabase.from("journal").insert([
      {
        user_id: userId,
        content: dreamDescription,
        oracle_symbols: symbols,
        oracle_message: interpretation,
        phase,
        archetype,
        created_at: new Date().toISOString(),
      },
    ]);

    if (dbError) {
      console.error("🛑 Supabase insert error:", dbError.message);
    }

    return res.status(200).json({
      interpretation,
      symbols,
      phase,
      archetype,
    });
  } catch (err: any) {
    console.error("🌑 Oracle error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
