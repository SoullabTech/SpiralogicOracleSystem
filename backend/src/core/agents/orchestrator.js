"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runLangChain = runLangChain;
exports.triggerPrefectFlow = triggerPrefectFlow;
const openai_1 = require("@langchain/openai");
const prompts_1 = require("@langchain/core/prompts");
const chains_1 = require("langchain/chains");
const axios_1 = __importDefault(require("axios"));
/**
 * Generates a poetic and thoughtful response using LangChain + OpenAI.
 */
async function runLangChain(query) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    const model = new openai_1.ChatOpenAI({
        openAIApiKey: apiKey,
        temperature: 0.7,
        modelName: "gpt-3.5-turbo",
    });
    const prompt = prompts_1.PromptTemplate.fromTemplate("You are a wise oracle. Provide a poetic and thoughtful response to: {query}");
    const chain = new chains_1.LLMChain({
        llm: model,
        prompt,
    });
    try {
        const result = await chain.invoke({ query });
        return result.text?.trim() || "🌀 The oracle was silent this time.";
    }
    catch (error) {
        console.error("❌ Error in runLangChain:", error);
        throw new Error("Failed to generate response from LangChain");
    }
}
/**
 * Triggers an external Prefect flow with the provided payload.
 */
async function triggerPrefectFlow(payload) {
    const prefectApiUrl = process.env.PREFECT_API_URL || "https://your-prefect-server/api/flows/trigger";
    try {
        const response = await axios_1.default.post(prefectApiUrl, payload);
        return response.data;
    }
    catch (error) {
        console.error("❌ Error triggering Prefect flow:", error?.response?.data || error.message);
        throw new Error("Failed to trigger Prefect flow");
    }
}
