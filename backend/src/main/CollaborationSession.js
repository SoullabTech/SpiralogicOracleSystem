"use strict";
// /src/main/CollaborationSession.ts
Object.defineProperty(exports, "__esModule", { value: true });
const AgentCollaboration_1 = require("../agents/AgentCollaboration");
const SpiralogicAgent_1 = require("../agents/SpiralogicAgent");
// Create multiple agents for the collaboration session
const agent1 = new SpiralogicAgent_1.SpiralogicAgent(agentContext1, userProfile);
const agent2 = new SpiralogicAgent_1.SpiralogicAgent(agentContext2, userProfile);
// Setup the collaboration environment
const collaboration = new AgentCollaboration_1.AgentCollaboration([agent1, agent2]);
// Run a collaborative query
const query = "How can I evolve my personal growth?";
collaboration.collaborateOnQuery(query).then((response) => {
    console.log(`Collaborative Agent Response: ${response}`);
});
