import { FlowManager } from './index';
export class LearningFlow {
    constructor(clientId) {
        this.session = null;
        this.flowManager = new FlowManager();
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
