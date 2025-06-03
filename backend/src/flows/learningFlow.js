"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearningFlow = void 0;
const index_1 = require("./index");
class LearningFlow {
    constructor(clientId) {
        this.session = null;
        this.flowManager = new index_1.FlowManager();
        this.clientId = clientId;
    }
    async start() {
        const result = await this.flowManager.startLearningFlow(this.clientId);
        this.session = result.session;
        return result;
    }
    async processInteraction(content) {
        if (!this.session) {
            throw new Error('Learning flow not started');
        }
        return this.flowManager.processInteractionFlow(this.clientId, this.session.id, content);
    }
    async complete() {
        if (!this.session) {
            throw new Error('Learning flow not started');
        }
        return this.flowManager.completeLearningFlow(this.clientId, this.session.id);
    }
}
exports.LearningFlow = LearningFlow;
