"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dreamService = exports.memoryService = exports.sessionService = exports.userService = exports.oracleService = exports.symbolicTrendsService = exports.surveyService = exports.notionIngestService = exports.insightHistoryService = exports.flowService = exports.feedbackService = exports.facilitatorService = exports.facetMapService = exports.chatService = exports.authService = void 0;
// src/services/authService.ts
exports.authService = {
    validateToken: (token) => {
        return token === 'valid-token';
    },
};
// src/services/chatService.ts
exports.chatService = {
    processMessage: (message) => {
        return `Echo: ${message}`;
    },
};
// src/services/facetMapService.ts
exports.facetMapService = {
    getMap: () => {
        return { 'Fire 1': 'Visionary', 'Water 2': 'Alchemist' };
    },
};
// src/services/facilitatorService.ts
exports.facilitatorService = {
    getFacilitatorTools: () => {
        return ['Circle Process', 'Check-in Protocol', 'Conflict Resolution'];
    },
};
const feedbackList = [];
exports.feedbackService = {
    submitFeedback: (feedback) => {
        feedbackList.push(feedback);
    },
    listFeedback: () => {
        return feedbackList;
    },
};
// src/services/flowService.ts
exports.flowService = {
    startFlow: (userId) => {
        return `Flow started for ${userId}`;
    },
};
const insightLog = [];
exports.insightHistoryService = {
    recordInsight: (insight) => {
        insightLog.push(insight);
    },
    getHistory: (userId) => {
        return insightLog.filter(i => i.userId === userId);
    },
};
// src/services/notionIngestService.ts
exports.notionIngestService = {
    ingest: (content) => {
        return `Content ingested to Notion: ${content.substring(0, 50)}...`;
    },
};
const responses = [];
exports.surveyService = {
    submitResponse: (response) => {
        responses.push(response);
    },
    getResponses: () => {
        return responses;
    },
};
// src/services/symbolicTrendsService.ts
exports.symbolicTrendsService = {
    analyzeSymbols: (symbols) => {
        return `Trends show increased presence of: ${symbols.join(', ')}`;
    },
};
// src/services/oracleService.ts
exports.oracleService = {
    ask: (question) => {
        return `The Oracle hears your question: "${question}"... and responds in silence.`;
    },
    interpretSymbols: (symbols) => {
        return `These symbols—${symbols.join(', ')}—hold keys to your current transformation.`;
    },
};
const users = {
    'u1': { id: 'u1', name: 'Aria Spiral', role: 'oracle' },
};
exports.userService = {
    getUser: (id) => {
        return users[id] || null;
    },
    isAdmin: (id) => {
        return users[id]?.role === 'admin';
    },
};
const mockSessions = [];
exports.sessionService = {
    startSession: (userId, context) => {
        const session = { id: `${Date.now()}`, userId, startedAt: new Date(), context };
        mockSessions.push(session);
        return session;
    },
    listSessions: (userId) => {
        return mockSessions.filter(s => s.userId === userId);
    },
};
const memories = [];
exports.memoryService = {
    store: (userId, content) => {
        const item = { userId, content, timestamp: new Date() };
        memories.push(item);
        return item;
    },
    recall: (userId) => {
        return memories.filter(m => m.userId === userId);
    },
};
const dreams = [];
exports.dreamService = {
    record: (dream) => {
        dreams.push(dream);
        return dream;
    },
    interpret: (dream) => {
        return `The dream contains ${dream.symbols?.join(', ') || 'no symbols'}, revealing hidden archetypes.`;
    },
};
