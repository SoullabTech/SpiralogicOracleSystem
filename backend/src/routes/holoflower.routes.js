"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.holoflowerRouter = void 0;
exports.setupHoloflowerWebSocket = setupHoloflowerWebSocket;
const express_1 = require("express");
const authenticate_1 = require("../middleware/authenticate");
const holoflowerService_1 = require("../services/holoflowerService");
const ws_1 = require("ws");
exports.holoflowerRouter = (0, express_1.Router)();
// Get user's holoflower state
exports.holoflowerRouter.get('/state', authenticate_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const userState = await holoflowerService_1.holoflowerService.getUserState(userId);
        const state = userState.holoflower.getState();
        res.json({
            success: true,
            data: {
                state,
                visualization: userState.holoflower.exportVisualizationData()
            }
        });
    }
    catch (error) {
        console.error('Error fetching holoflower state:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch holoflower state'
        });
    }
});
// Update house intensity
exports.holoflowerRouter.post('/house/:houseId/intensity', authenticate_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { houseId } = req.params;
        const { intensity } = req.body;
        await holoflowerService_1.holoflowerService.updateHouseIntensity(userId, houseId, intensity);
        res.json({
            success: true,
            message: 'House intensity updated'
        });
    }
    catch (error) {
        console.error('Error updating house intensity:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update house intensity'
        });
    }
});
// Activate transformation between houses
exports.holoflowerRouter.post('/transformation', authenticate_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { fromHouseId, toHouseId } = req.body;
        await holoflowerService_1.holoflowerService.activateTransformation(userId, fromHouseId, toHouseId);
        res.json({
            success: true,
            message: 'Transformation activated'
        });
    }
    catch (error) {
        console.error('Error activating transformation:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to activate transformation'
        });
    }
});
// Integrate Aether
exports.holoflowerRouter.post('/integrate-aether', authenticate_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        await holoflowerService_1.holoflowerService.integrateAether(userId);
        res.json({
            success: true,
            message: 'Aether integration complete'
        });
    }
    catch (error) {
        console.error('Error integrating aether:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to integrate aether'
        });
    }
});
// Get transformation history
exports.holoflowerRouter.get('/transformations', authenticate_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const history = await holoflowerService_1.holoflowerService.getTransformationHistory(userId);
        res.json({
            success: true,
            data: history
        });
    }
    catch (error) {
        console.error('Error fetching transformation history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch transformation history'
        });
    }
});
// Create group pattern
exports.holoflowerRouter.post('/group/:groupId', authenticate_1.authenticate, async (req, res) => {
    try {
        const { groupId } = req.params;
        const { participantIds } = req.body;
        const pattern = await holoflowerService_1.holoflowerService.createGroupPattern(groupId, participantIds);
        res.json({
            success: true,
            data: pattern
        });
    }
    catch (error) {
        console.error('Error creating group pattern:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create group pattern'
        });
    }
});
// Get collective field
exports.holoflowerRouter.get('/collective-field', async (req, res) => {
    try {
        const field = await holoflowerService_1.holoflowerService.getCollectiveField();
        res.json({
            success: true,
            data: field
        });
    }
    catch (error) {
        console.error('Error fetching collective field:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch collective field'
        });
    }
});
// WebSocket endpoint for real-time updates
function setupHoloflowerWebSocket(server) {
    const wss = new ws_1.WebSocketServer({
        server,
        path: '/ws/holoflower'
    });
    wss.on('connection', (ws, req) => {
        const userId = req.url?.split('/').pop();
        if (!userId) {
            ws.close();
            return;
        }
        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message.toString());
                switch (data.type) {
                    case 'update-intensity':
                        await holoflowerService_1.holoflowerService.updateHouseIntensity(userId, data.houseId, data.intensity);
                        break;
                    case 'activate-transformation':
                        await holoflowerService_1.holoflowerService.activateTransformation(userId, data.fromHouseId, data.toHouseId);
                        break;
                    case 'integrate-aether':
                        await holoflowerService_1.holoflowerService.integrateAether(userId);
                        break;
                    case 'request-group-pattern':
                        // Group pattern will be broadcast to all connected clients
                        break;
                }
            }
            catch (error) {
                console.error('WebSocket message error:', error);
            }
        });
        ws.on('close', () => {
            console.log(`WebSocket closed for user ${userId}`);
        });
    });
    return wss;
}
