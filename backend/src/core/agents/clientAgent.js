"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientAgent = void 0;
const oracleAgent_1 = require("./oracleAgent");
const MainOracleAgent_1 = require("../core/agents/MainOracleAgent");
class ClientAgent extends oracleAgent_1.OracleAgent {
    constructor(clientId) {
        super();
        this.clientId = clientId;
    }
    async processQuery(query) {
        const baseResponse = await super.processQuery(query);
        console.log(`[ClientAgent] Processing response for client: ${this.clientId}`);
        const personalizedResponse = `${baseResponse.response}\n\n🧩 Tailored for you, valued client.`;
        const updatedMetadata = {
            ...(baseResponse.metadata || {}),
            timestamp: new Date().toISOString(),
            clientId: this.clientId,
            archetype: baseResponse.metadata?.archetype || 'Client',
            phase: baseResponse.metadata?.phase || 'Client Phase',
            emotion_score: baseResponse.metadata?.emotion_score || 0.8,
        };
        const finalResponse = {
            ...baseResponse,
            response: personalizedResponse,
            metadata: updatedMetadata,
            routingPath: [...(baseResponse.routingPath ?? []), 'client-agent'],
        };
        // Send wisdom to MainOracleAgent (afferent)
        await MainOracleAgent_1.oracle.storeExchange(this.clientId, query, finalResponse);
        return finalResponse;
    }
}
exports.ClientAgent = ClientAgent;
