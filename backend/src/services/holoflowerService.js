"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.holoflowerService = exports.HoloflowerService = void 0;
const SacredHoloflower_1 = require("../core/SacredHoloflower");
const supabaseClient_1 = require("../lib/supabaseClient");
const ws_1 = require("ws");
class HoloflowerService {
    constructor() {
        this.userStates = new Map();
        this.groupPatterns = new Map();
        this.wsServer = null;
        this.updateInterval = null;
        this.initializeWebSocketServer();
        this.startPeriodicUpdates();
    }
    initializeWebSocketServer() {
        this.wsServer = new ws_1.WebSocketServer({ port: 5002 });
        this.wsServer.on('connection', (ws, req) => {
            const userId = req.url?.split('/').pop();
            if (!userId)
                return;
            ws.on('message', (message) => {
                const data = JSON.parse(message.toString());
                this.handleClientMessage(userId, data);
            });
            const userState = this.getUserState(userId);
            ws.send(JSON.stringify({
                type: 'initial-state',
                state: userState.holoflower.getState()
            }));
        });
    }
    handleClientMessage(userId, data) {
        const userState = this.getUserState(userId);
        switch (data.type) {
            case 'update-intensity':
                this.updateHouseIntensity(userId, data.houseId, data.intensity);
                break;
            case 'activate-transformation':
                this.activateTransformation(userId, data.fromHouseId, data.toHouseId);
                break;
            case 'integrate-aether':
                this.integrateAether(userId);
                break;
            case 'request-group-pattern':
                this.sendGroupPattern(data.groupId);
                break;
        }
    }
    async getUserState(userId) {
        if (this.userStates.has(userId)) {
            return this.userStates.get(userId);
        }
        const savedState = await this.loadUserState(userId);
        const holoflower = new SacredHoloflower_1.SacredHoloflower(savedState);
        const userState = {
            userId,
            holoflower,
            lastUpdate: new Date(),
            transformationHistory: []
        };
        this.userStates.set(userId, userState);
        return userState;
    }
    async loadUserState(userId) {
        const { data, error } = await supabaseClient_1.supabase
            .from('holoflower_states')
            .select('state')
            .eq('user_id', userId)
            .single();
        return data?.state;
    }
    async saveUserState(userId) {
        const userState = await this.getUserState(userId);
        const state = userState.holoflower.getState();
        await supabaseClient_1.supabase
            .from('holoflower_states')
            .upsert({
            user_id: userId,
            state,
            updated_at: new Date().toISOString()
        });
    }
    async updateHouseIntensity(userId, houseId, intensity) {
        const userState = await this.getUserState(userId);
        userState.holoflower.updateHouseIntensity(houseId, intensity);
        userState.lastUpdate = new Date();
        userState.transformationHistory.push({
            timestamp: new Date(),
            type: 'intensity',
            details: { houseId, intensity }
        });
        this.broadcastUpdate(userId, userState.holoflower.getState());
        await this.saveUserState(userId);
        await this.checkForEmergentPatterns(userId);
    }
    async activateTransformation(userId, fromHouseId, toHouseId) {
        const userState = await this.getUserState(userId);
        userState.holoflower.activateTransformation(fromHouseId, toHouseId);
        userState.transformationHistory.push({
            timestamp: new Date(),
            type: 'transformation',
            details: { fromHouseId, toHouseId }
        });
        this.broadcastUpdate(userId, userState.holoflower.getState());
        await this.saveUserState(userId);
        await this.logTransformationInsight(userId, fromHouseId, toHouseId);
    }
    async integrateAether(userId) {
        const userState = await this.getUserState(userId);
        userState.holoflower.integrateAether();
        userState.transformationHistory.push({
            timestamp: new Date(),
            type: 'integration',
            details: { centerIntegration: userState.holoflower.getState().centerIntegration }
        });
        this.broadcastUpdate(userId, userState.holoflower.getState());
        await this.saveUserState(userId);
    }
    broadcastUpdate(userId, state) {
        if (!this.wsServer)
            return;
        const message = JSON.stringify({
            type: 'state-update',
            state
        });
        this.wsServer.clients.forEach(client => {
            if (client.readyState === 1) {
                client.send(message);
            }
        });
    }
    async checkForEmergentPatterns(userId) {
        const userState = await this.getUserState(userId);
        const state = userState.holoflower.getState();
        const patterns = [];
        const elementIntensities = new Map();
        state.houses.forEach(house => {
            const current = elementIntensities.get(house.element) || 0;
            elementIntensities.set(house.element, current + house.intensity);
        });
        const dominantElement = Array.from(elementIntensities.entries())
            .sort((a, b) => b[1] - a[1])[0][0];
        if (elementIntensities.get(dominantElement) > 2.5) {
            patterns.push(`${dominantElement}-dominant`);
        }
        if (state.centerIntegration > 0.8) {
            patterns.push('high-integration');
        }
        if (state.overallBalance > 0.85) {
            patterns.push('elemental-harmony');
        }
        const recentTransformations = userState.transformationHistory
            .filter(t => t.type === 'transformation' &&
            new Date().getTime() - t.timestamp.getTime() < 3600000);
        if (recentTransformations.length > 5) {
            patterns.push('rapid-transformation');
        }
        if (patterns.length > 0) {
            await this.recordEmergentPattern(userId, patterns);
        }
    }
    async recordEmergentPattern(userId, patterns) {
        await supabaseClient_1.supabase
            .from('holoflower_patterns')
            .insert({
            user_id: userId,
            patterns,
            timestamp: new Date().toISOString()
        });
    }
    async logTransformationInsight(userId, fromHouseId, toHouseId) {
        const insights = this.generateTransformationInsight(fromHouseId, toHouseId);
        await supabaseClient_1.supabase
            .from('transformation_insights')
            .insert({
            user_id: userId,
            from_house: fromHouseId,
            to_house: toHouseId,
            insight: insights,
            timestamp: new Date().toISOString()
        });
    }
    generateTransformationInsight(fromHouseId, toHouseId) {
        const [fromElement, fromPhase] = fromHouseId.split('-');
        const [toElement, toPhase] = toHouseId.split('-');
        const insights = {
            'fire-cardinal->fire-fixed': 'Channeling initial spark into sustained will',
            'fire-fixed->fire-mutable': 'Releasing rigid control for inspired flow',
            'earth-cardinal->earth-fixed': 'Grounding ambition into stable foundation',
            'earth-fixed->earth-mutable': 'Softening structure for adaptive growth',
            'air-cardinal->air-fixed': 'Crystallizing ideas into clear concepts',
            'air-fixed->air-mutable': 'Opening fixed thoughts to new perspectives',
            'water-cardinal->water-fixed': 'Deepening emotional currents',
            'water-fixed->water-mutable': 'Releasing emotional attachments for flow',
            'fire->earth': 'Manifesting vision into form',
            'earth->water': 'Softening material focus with feeling',
            'water->air': 'Lifting emotions into understanding',
            'air->fire': 'Igniting ideas with passionate action'
        };
        const key = fromElement === toElement ?
            `${fromHouseId}->${toHouseId}` :
            `${fromElement}->${toElement}`;
        return insights[key] || `Transforming ${fromElement} ${fromPhase} to ${toElement} ${toPhase}`;
    }
    async createGroupPattern(groupId, participantIds) {
        const collectiveHouses = new Map();
        for (const userId of participantIds) {
            const userState = await this.getUserState(userId);
            const state = userState.holoflower.getState();
            state.houses.forEach(house => {
                const current = collectiveHouses.get(house.id) || 0;
                collectiveHouses.set(house.id, current + house.intensity);
            });
        }
        const averagedHouses = Array.from(collectiveHouses.entries()).map(([id, totalIntensity]) => {
            const house = (await this.getUserState(participantIds[0])).holoflower.getState()
                .houses.find(h => h.id === id);
            return {
                ...house,
                intensity: totalIntensity / participantIds.length
            };
        });
        const collectiveHoloflower = new SacredHoloflower_1.SacredHoloflower();
        averagedHouses.forEach(house => {
            collectiveHoloflower.updateHouseIntensity(house.id, house.intensity);
        });
        const resonancePatterns = this.calculateResonancePatterns(participantIds);
        const emergentQualities = this.identifyEmergentQualities(collectiveHoloflower.getState());
        const groupPattern = {
            groupId,
            participants: participantIds,
            collectiveState: collectiveHoloflower.getState(),
            resonancePatterns,
            emergentQualities
        };
        this.groupPatterns.set(groupId, groupPattern);
        return groupPattern;
    }
    calculateResonancePatterns(participantIds) {
        const resonances = new Map();
        resonances.set('harmony', Math.random() * 0.5 + 0.5);
        resonances.set('synergy', Math.random() * 0.5 + 0.5);
        resonances.set('coherence', Math.random() * 0.5 + 0.5);
        return resonances;
    }
    identifyEmergentQualities(state) {
        const qualities = [];
        if (state.overallBalance > 0.8) {
            qualities.push('Collective Harmony');
        }
        if (state.centerIntegration > 0.7) {
            qualities.push('Unified Field');
        }
        const activeElements = state.houses
            .filter(h => h.intensity > 0.6)
            .map(h => h.element);
        const uniqueElements = new Set(activeElements);
        if (uniqueElements.size === 4) {
            qualities.push('Full Spectrum Activation');
        }
        return qualities;
    }
    sendGroupPattern(groupId) {
        const pattern = this.groupPatterns.get(groupId);
        if (!pattern || !this.wsServer)
            return;
        const message = JSON.stringify({
            type: 'group-pattern',
            pattern
        });
        this.wsServer.clients.forEach(client => {
            if (client.readyState === 1) {
                client.send(message);
            }
        });
    }
    startPeriodicUpdates() {
        this.updateInterval = setInterval(async () => {
            for (const [userId, userState] of this.userStates) {
                const lunarPhase = this.calculateLunarPhase();
                userState.holoflower.applyLunarInfluence(lunarPhase);
                this.broadcastUpdate(userId, userState.holoflower.getState());
            }
        }, 60000); // Update every minute
    }
    calculateLunarPhase() {
        const synodicMonth = 29.53059;
        const knownNewMoon = new Date('2024-01-11');
        const now = new Date();
        const daysSince = (now.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
        const phase = (daysSince % synodicMonth) / synodicMonth;
        return phase;
    }
    async getTransformationHistory(userId) {
        const userState = await this.getUserState(userId);
        return userState.transformationHistory;
    }
    async getCollectiveField() {
        const allStates = Array.from(this.userStates.values());
        const fieldIntensity = allStates.reduce((sum, state) => sum + state.holoflower.getState().centerIntegration, 0) / allStates.length;
        const dominantElements = new Map();
        allStates.forEach(state => {
            state.holoflower.getState().houses.forEach(house => {
                const current = dominantElements.get(house.element) || 0;
                dominantElements.set(house.element, current + house.intensity);
            });
        });
        return {
            participants: allStates.length,
            fieldIntensity,
            elementalBalance: Object.fromEntries(dominantElements),
            timestamp: new Date()
        };
    }
    cleanup() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        if (this.wsServer) {
            this.wsServer.close();
        }
    }
}
exports.HoloflowerService = HoloflowerService;
exports.holoflowerService = new HoloflowerService();
