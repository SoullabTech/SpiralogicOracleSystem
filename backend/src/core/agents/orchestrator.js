import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";
import axios from "axios";
/**
 * Generates a poetic and thoughtful response using LangChain + OpenAI.
 */
export async function runLangChain(query) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    const model = new ChatOpenAI({
        openAIApiKey: apiKey,
        temperature: 0.7,
        modelName: "gpt-3.5-turbo",
    });
    const prompt = PromptTemplate.fromTemplate("You are a wise oracle. Provide a poetic and thoughtful response to: {query}");
    const chain = new LLMChain({
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
export async function triggerPrefectFlow(payload) {
    const prefectApiUrl = process.env.PREFECT_API_URL || "https://your-prefect-server/api/flows/trigger";
    try {
        const response = await axios.post(prefectApiUrl, payload);
        return response.data;
    }
    catch (error) {
        console.error("❌ Error triggering Prefect flow:", error?.response?.data || error.message);
        throw new Error("Failed to trigger Prefect flow");
    }
}
