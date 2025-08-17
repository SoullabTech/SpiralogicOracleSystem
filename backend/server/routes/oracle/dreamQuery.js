"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const supabase_1 = require("../../lib/supabase");
const extractSymbols_1 = require("../../lib/extractSymbols");
const oracleService_1 = require("../../services/oracleService");
const router = express_1.default.Router();
const dreamSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    dreamDescription: zod_1.z.string(),
    context: zod_1.z
        .object({
        symbols: zod_1.z.array(zod_1.z.string()).optional(),
    })
        .optional(),
});
router.post("/dream/query", async (req, res) => {
    try {
        const parsed = dreamSchema.parse(req.body);
        const { userId, dreamDescription, context } = parsed;
        const symbols = context?.symbols?.length
            ? context.symbols
            : await (0, extractSymbols_1.extractSymbolsFromText)(dreamDescription);
        const result = await (0, oracleService_1.getOracleInterpretation)({
            input: dreamDescription,
            symbols,
        });
        const { interpretation, phase, archetype } = result;
        const { error: dbError } = await supabase_1.supabase.from("journal").insert([
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
    }
    catch (err) {
        console.error("🌑 Oracle error:", err.message);
        return res.status(500).json({ error: err.message });
    }
});
exports.default = router;
