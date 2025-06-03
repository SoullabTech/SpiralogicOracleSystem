"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OracleAgent = void 0;
const ritualEngine_1 = require("../../lib/ritualEngine");
class OracleAgent {
    constructor(options = {}) {
        this.debug = options.debug ?? false;
    }
    async processQuery(query) {
        if (this.debug) {
            console.log("[OracleAgent] Processing query:", query);
        }
        const detectedElement = this.detectElement(query);
        const ritual = (0, ritualEngine_1.getRitualForPhase)(detectedElement);
        const simulatedResponse = `Processed query: ${query}`;
        const metadata = {
            timestamp: new Date().toISOString(),
            element: detectedElement,
            processedAt: new Date().toISOString(),
            prefect: {
                task: "simulate",
                status: "success",
            },
            ritual, // 👈 New metadata field
        };
        return {
            response: simulatedResponse,
            confidence: 0.9,
            metadata,
            routingPath: [detectedElement.toLowerCase(), "oracle-agent"],
        };
    }
    detectElement(text) {
        return getElementalPhase(text); // using spiralLogic.ts
    }
}
exports.OracleAgent = OracleAgent;
