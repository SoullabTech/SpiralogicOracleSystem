"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.astrologyRouter = void 0;
exports.setupAstrologyWebSocket = setupAstrologyWebSocket;
const express_1 = require("express");
const authenticate_1 = require("../middleware/authenticate");
const comprehensiveAstrologicalService_1 = require("../services/comprehensiveAstrologicalService");
const ws_1 = require("ws");
exports.astrologyRouter = (0, express_1.Router)();
// Set user birth data and calculate natal chart
exports.astrologyRouter.post('/birth-chart', authenticate_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { date, time, location } = req.body;
        if (!date || !time || !location) {
            return res.status(400).json({
                success: false,
                error: 'Birth date, time, and location are required'
            });
        }
        const birthData = {
            date: new Date(date),
            time,
            location: {
                lat: location.lat,
                lng: location.lng,
                timezone: location.timezone || 'UTC'
            }
        };
        const birthChart = await comprehensiveAstrologicalService_1.comprehensiveAstrologicalService.calculateComprehensiveBirthChart(userId, birthData);
        res.json({
            success: true,
            data: {
                birthChart: {
                    planets: Object.fromEntries(birthChart.planets),
                    houses: birthChart.houses,
                    aspects: birthChart.aspects,
                    patterns: birthChart.patterns,
                    dominantElements: Object.fromEntries(birthChart.dominantElements),
                    dominantModalities: Object.fromEntries(birthChart.dominantModalities)
                }
            }
        });
    }
    catch (error) {
        console.error('Error calculating birth chart:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to calculate birth chart'
        });
    }
});
// Get current transits
exports.astrologyRouter.get('/transits', authenticate_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const transits = await comprehensiveAstrologicalService_1.comprehensiveAstrologicalService.trackCurrentTransits(userId);
        res.json({
            success: true,
            data: {
                transits,
                count: transits.length,
                mostIntense: transits
                    .sort((a, b) => b.intensity - a.intensity)
                    .slice(0, 5)
            }
        });
    }
    catch (error) {
        console.error('Error fetching transits:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch current transits'
        });
    }
});
// Get sacred timing recommendations
exports.astrologyRouter.get('/sacred-timing', authenticate_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const sacredTiming = await comprehensiveAstrologicalService_1.comprehensiveAstrologicalService.generateSacredTiming(userId);
        res.json({
            success: true,
            data: sacredTiming
        });
    }
    catch (error) {
        console.error('Error generating sacred timing:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate sacred timing'
        });
    }
});
// Get timing for specific house
exports.astrologyRouter.get('/house/:houseNumber/timing', authenticate_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const houseNumber = parseInt(req.params.houseNumber);
        if (houseNumber < 1 || houseNumber > 12) {
            return res.status(400).json({
                success: false,
                error: 'Invalid house number. Must be between 1 and 12.'
            });
        }
        const sacredTiming = await comprehensiveAstrologicalService_1.comprehensiveAstrologicalService.generateSacredTiming(userId);
        const houseTiming = sacredTiming.recommendations.find(r => r.houseNumber === houseNumber);
        res.json({
            success: true,
            data: {
                houseNumber,
                timing: houseTiming,
                lunarSupport: sacredTiming.lunarCycle.monthlyActivations
                    .filter(a => a.house === houseNumber),
                cosmicSupport: sacredTiming.cosmicSupport
                    .filter(s => s.supportedHouses.includes(houseNumber))
            }
        });
    }
    catch (error) {
        console.error('Error fetching house timing:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch house timing'
        });
    }
});
// Get lunar cycle information
exports.astrologyRouter.get('/lunar-cycle', authenticate_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const sacredTiming = await comprehensiveAstrologicalService_1.comprehensiveAstrologicalService.generateSacredTiming(userId);
        res.json({
            success: true,
            data: sacredTiming.lunarCycle
        });
    }
    catch (error) {
        console.error('Error fetching lunar cycle:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch lunar cycle'
        });
    }
});
// Get upcoming eclipses
exports.astrologyRouter.get('/eclipses', authenticate_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const sacredTiming = await comprehensiveAstrologicalService_1.comprehensiveAstrologicalService.generateSacredTiming(userId);
        res.json({
            success: true,
            data: {
                eclipses: sacredTiming.eclipseWindows,
                nextEclipse: sacredTiming.eclipseWindows[0]
            }
        });
    }
    catch (error) {
        console.error('Error fetching eclipses:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch eclipse information'
        });
    }
});
// Get retrograde information
exports.astrologyRouter.get('/retrogrades', authenticate_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const sacredTiming = await comprehensiveAstrologicalService_1.comprehensiveAstrologicalService.generateSacredTiming(userId);
        res.json({
            success: true,
            data: {
                currentRetrogrades: sacredTiming.retrogradePeriods
                    .filter(r => r.startDate <= new Date() && r.endDate >= new Date()),
                upcomingRetrogrades: sacredTiming.retrogradePeriods
                    .filter(r => r.startDate > new Date())
                    .slice(0, 5)
            }
        });
    }
    catch (error) {
        console.error('Error fetching retrogrades:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch retrograde information'
        });
    }
});
// Analyze group astrology
exports.astrologyRouter.post('/group/:groupId/analyze', authenticate_1.authenticate, async (req, res) => {
    try {
        const { groupId } = req.params;
        const { participantIds } = req.body;
        if (!participantIds || !Array.isArray(participantIds) || participantIds.length < 2) {
            return res.status(400).json({
                success: false,
                error: 'At least 2 participant IDs are required'
            });
        }
        const groupData = await comprehensiveAstrologicalService_1.comprehensiveAstrologicalService.analyzeGroupAstrology(groupId, participantIds);
        res.json({
            success: true,
            data: {
                groupId,
                participantCount: participantIds.length,
                compositeChart: groupData.compositeChart,
                synastryPatterns: groupData.synastryPatterns,
                collectiveTransits: groupData.collectiveTransits,
                groupDynamics: groupData.groupDynamics,
                optimalTiming: groupData.optimalTiming
            }
        });
    }
    catch (error) {
        console.error('Error analyzing group astrology:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to analyze group astrology'
        });
    }
});
// Get synastry between two users
exports.astrologyRouter.get('/synastry/:userId1/:userId2', authenticate_1.authenticate, async (req, res) => {
    try {
        const { userId1, userId2 } = req.params;
        // Create temporary group to analyze synastry
        const tempGroupId = `synastry-${userId1}-${userId2}`;
        const groupData = await comprehensiveAstrologicalService_1.comprehensiveAstrologicalService.analyzeGroupAstrology(tempGroupId, [userId1, userId2]);
        const synastry = groupData.synastryPatterns[0];
        res.json({
            success: true,
            data: {
                participant1: userId1,
                participant2: userId2,
                synastry,
                compositeChart: groupData.compositeChart
            }
        });
    }
    catch (error) {
        console.error('Error calculating synastry:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to calculate synastry'
        });
    }
});
// Get transformation opportunities
exports.astrologyRouter.get('/transformation-opportunities', authenticate_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const transits = await comprehensiveAstrologicalService_1.comprehensiveAstrologicalService.trackCurrentTransits(userId);
        // Filter for major transformation opportunities
        const opportunities = transits
            .filter(t => t.intensity > 0.7)
            .map(t => ({
            planet: t.transit.planet,
            house: t.houseActivated,
            type: t.type,
            intensity: t.intensity,
            opportunity: t.transformationOpportunity,
            timing: {
                start: t.transit.startDate,
                exact: t.transit.exactDate,
                end: t.transit.endDate
            }
        }));
        res.json({
            success: true,
            data: {
                opportunities,
                count: opportunities.length,
                mostPowerful: opportunities[0]
            }
        });
    }
    catch (error) {
        console.error('Error fetching transformation opportunities:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch transformation opportunities'
        });
    }
});
// Get cosmic support periods
exports.astrologyRouter.get('/cosmic-support', authenticate_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const sacredTiming = await comprehensiveAstrologicalService_1.comprehensiveAstrologicalService.generateSacredTiming(userId);
        const currentSupport = sacredTiming.cosmicSupport
            .filter(s => s.startDate <= new Date() && s.endDate >= new Date());
        const upcomingSupport = sacredTiming.cosmicSupport
            .filter(s => s.startDate > new Date())
            .slice(0, 5);
        res.json({
            success: true,
            data: {
                current: currentSupport,
                upcoming: upcomingSupport,
                strongestSupport: sacredTiming.cosmicSupport
                    .sort((a, b) => b.intensity - a.intensity)[0]
            }
        });
    }
    catch (error) {
        console.error('Error fetching cosmic support:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch cosmic support periods'
        });
    }
});
// WebSocket endpoint for real-time astrological updates
function setupAstrologyWebSocket(server) {
    const wss = new ws_1.WebSocketServer({
        server,
        path: '/ws/astrology'
    });
    wss.on('connection', (ws, req) => {
        const userId = req.url?.split('/').pop();
        if (!userId) {
            ws.close();
            return;
        }
        console.log(`Astrology WebSocket connected for user ${userId}`);
        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message.toString());
                switch (data.type) {
                    case 'set-birth-data':
                        await comprehensiveAstrologicalService_1.comprehensiveAstrologicalService.calculateComprehensiveBirthChart(userId, data.birthData);
                        break;
                    case 'request-timing':
                        await comprehensiveAstrologicalService_1.comprehensiveAstrologicalService.generateSacredTiming(userId);
                        break;
                    case 'request-group-analysis':
                        await comprehensiveAstrologicalService_1.comprehensiveAstrologicalService.analyzeGroupAstrology(data.groupId, data.participantIds);
                        break;
                    case 'subscribe-transits':
                        // Client wants real-time transit updates
                        const interval = setInterval(async () => {
                            const transits = await comprehensiveAstrologicalService_1.comprehensiveAstrologicalService.trackCurrentTransits(userId);
                            ws.send(JSON.stringify({
                                type: 'transit-update',
                                transits,
                                timestamp: new Date()
                            }));
                        }, 60000); // Every minute
                        ws.on('close', () => clearInterval(interval));
                        break;
                }
            }
            catch (error) {
                console.error('WebSocket message error:', error);
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Failed to process request'
                }));
            }
        });
        ws.on('close', () => {
            console.log(`Astrology WebSocket closed for user ${userId}`);
        });
        ws.on('error', (error) => {
            console.error(`WebSocket error for user ${userId}:`, error);
        });
        // Send initial astrological state
        comprehensiveAstrologicalService_1.comprehensiveAstrologicalService.trackCurrentTransits(userId).then(transits => {
            ws.send(JSON.stringify({
                type: 'initial-transits',
                transits,
                timestamp: new Date()
            }));
        });
    });
    return wss;
}
