"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const openai_1 = require("openai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = express_1.default.Router();
const openai = new openai_1.OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
router.post("/extract-symbols", async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: "Missing dream text" });
    }
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are a dream symbol interpreter. Extract key symbolic objects, archetypes, animals, places, or patterns from the user's dream. Respond ONLY with an array of 3-10 symbolic keywords, no explanation.",
                },
                {
                    role: "user",
                    content: text,
                },
            ],
            temperature: 0.7,
        });
        const raw = completion.choices[0].message.content || "";
        const symbols = raw
            .replace(/[\[\]"]/g, "")
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 1);
        res.json({ symbols });
    }
    catch (error) {
        console.error("Symbol extraction error:", error);
        res.status(500).json({ error: "Failed to extract symbols" });
    }
});
exports.default = router;
