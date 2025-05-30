// /src/agents/AgentCollaboration.ts
class AgentCollaboration {
    constructor(agents) {
        this.agents = agents;
    }
    // This method allows agents to collaborate on a query
    async collaborateOnQuery(query) {
        const responses = await Promise.all(this.agents.map(agent => agent.engage(query)));
        const collectiveResponse = responses.join('\n');
        return collectiveResponse;
    }
}
export {};
