"use strict";
// 📁 BACKEND — oracle-backend/server/routes/oracle/symbolThreads.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabase_1 = require("../../lib/supabase");
const router = express_1.default.Router();
/**
 * GET /api/oracle/symbol/:symbol
 * Fetch all journal entries where `oracle_symbols` includes the requested symbol.
 */
router.get("/symbol/:symbol", async (req, res) => {
    const { symbol } = req.params;
    if (!symbol) {
        return res.status(400).json({ error: "Symbol is required in path" });
    }
    try {
        const { data, error } = await supabase_1.supabase
            .from("journal")
            .select("*")
            .contains("oracle_symbols", [symbol]);
        if (error) {
            console.error("🛑 Supabase fetch error:", error.message);
            return res
                .status(500)
                .json({ error: "Database error fetching symbol thread" });
        }
        return res.status(200).json({ symbol, entries: data });
    }
    catch (err) {
        console.error("🌑 Symbol thread fetch error:", err.message);
        return res.status(500).json({ error: "Unexpected server error" });
    }
});
exports.default = router;
