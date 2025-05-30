export class BaseAgent {
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
