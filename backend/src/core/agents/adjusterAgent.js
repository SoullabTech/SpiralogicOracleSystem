"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.personalOracle = exports.PersonalOracleAgent = void 0;
const oracleAgent_1 = require("./oracleAgent");
const memoryService_1 = require("../../services/memoryService");
const oracleLogger_1 = require("../../utils/oracleLogger");
const facetUtil_1 = require("../../utils/facetUtil");
const fireAgent_1 = require("./fireAgent");
const waterAgent_1 = require("./waterAgent");
const earthAgent_1 = require("./earthAgent");
const airAgent_1 = require("./airAgent");
const aetherAgent_1 = require("./aetherAgent");
const guideAgent_1 = require("./guideAgent");
const mentorAgent_1 = require("./mentorAgent");
const DreamAgent_1 = require("./DreamAgent");
const feedbackPrompts_1 = require("../../constants/feedbackPrompts");
const logger_1 = require("../../utils/logger");
const shadowWorkModule_1 = require("../../modules/shadowWorkModule");
// Simple query scoring function
function scoreQuery(input) {
    const lower = input.toLowerCase();
    return {
        fire: lower.includes("passion") || lower.includes("energy") || lower.includes("action") ? 1 : 0,
        water: lower.includes("emotion") || lower.includes("feeling") || lower.includes("flow") ? 1 : 0,
        earth: lower.includes("ground") || lower.includes("practical") || lower.includes("stable") ? 1 : 0,
        air: lower.includes("think") || lower.includes("idea") || lower.includes("communicate") ? 1 : 0,
        aether: 0.5 // default baseline
    };
}
class PersonalOracleAgent extends oracleAgent_1.OracleAgent {
    constructor() {
        super({ debug: false });
        this.fire = new fireAgent_1.FireAgent();
        this.water = new waterAgent_1.WaterAgent();
        this.earth = new earthAgent_1.EarthAgent();
        this.air = new airAgent_1.AirAgent();
        this.aether = new aetherAgent_1.AetherAgent();
        this.guide = new guideAgent_1.GuideAgent();
        this.mentor = new mentorAgent_1.MentorAgent();
        this.dream = new DreamAgent_1.DreamAgent();
    }
    async processQuery(query) {
        const input = typeof query === 'string' ? query : query.input;
        const userId = typeof query === 'string' ? 'anonymous' : query.userId;
        logger_1.logger.info("🔮 PersonalOracleAgent activated", { userId });
        const memories = await (0, memoryService_1.getRelevantMemories)(userId, input, 5);
        const lower = input.toLowerCase();
        // 1️⃣ Symbolic cue routing
        if (lower.includes("dream")) {
            return await this.wrapAgent(this.dream, query, memories);
        }
        if (["coach", "mentor", "goal", "plan"].some(k => lower.includes(k))) {
            return await this.wrapAgent(this.mentor, query, memories);
        }
        // Relationship agent not implemented yet
        // if (["relationship", "partner", "conflict"].some(k => lower.includes(k))) {
        //   return await this.wrapAgent(this.relationship, query, memories);
        // }
        if (["guidance", "support", "direction"].some(k => lower.includes(k))) {
            return await this.wrapAgent(this.guide, query, memories);
        }
        // Adjuster agent not implemented yet
        // if (["rupture", "disruption", "realign", "fracture"].some(k => lower.includes(k))) {
        //   return await this.wrapAgent(this.adjuster, query, memories);
        // }
        // 2️⃣ Shadow work
        const shadow = await (0, shadowWorkModule_1.runShadowWork)(input, userId);
        if (shadow)
            return { ...shadow, feedbackPrompt: feedbackPrompts_1.feedbackPrompts.shadow };
        // 3️⃣ Elemental routing fallback
        const scores = scoreQuery(input);
        let best = "aether";
        for (const [k, v] of Object.entries(scores)) {
            if (v > scores[best])
                best = k;
        }
        const agent = {
            fire: this.fire,
            water: this.water,
            earth: this.earth,
            air: this.air,
            aether: this.aether,
        }[best];
        if (!agent) {
            throw new Error(`No agent found for element: ${best}`);
        }
        return await this.wrapAgent(agent, query, memories);
    }
    async wrapAgent(agent, query, context) {
        const input = typeof query === 'string' ? query : query.input;
        const userId = typeof query === 'string' ? 'anonymous' : query.userId;
        const response = await agent.processQuery(input);
        const facet = await (0, facetUtil_1.detectFacetFromInput)(input);
        response.metadata = {
            ...response.metadata,
            facet,
            provider: agent.constructor.name,
        };
        response.feedbackPrompt ?? (response.feedbackPrompt = feedbackPrompts_1.feedbackPrompts.elemental);
        await (0, memoryService_1.storeMemoryItem)(userId, response.content);
        await (0, oracleLogger_1.logOracleInsight)({
            anon_id: userId,
            archetype: response.metadata?.archetype || "Oracle",
            element: response.metadata?.element || "aether",
            insight: {
                message: response.content,
                raw_input: input,
            },
            emotion: response.confidence ?? 0.9,
            phase: response.metadata?.phase || "guidance",
            context,
        });
        return response;
    }
}
exports.PersonalOracleAgent = PersonalOracleAgent;
exports.personalOracle = new PersonalOracleAgent();
