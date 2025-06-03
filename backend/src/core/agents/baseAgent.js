"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAgent = void 0;
class BaseAgent {
    async processQuery(query) {
        console.log("[BaseAgent] Processing query:", query);
        return {
            response: "Base agent response",
            metadata: {
                timestamp: new Date().toISOString()
            },
            routingPath: ['baseAgent']
        };
    }
}
exports.BaseAgent = BaseAgent;
