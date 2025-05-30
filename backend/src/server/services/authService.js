// src/services/authService.ts
export const authService = {
    validateToken: (token) => {
        return token === 'valid-token';
    },
};
// src/services/chatService.ts
export const chatService = {
    processMessage: (message) => {
        return `Echo: ${message}`;
    },
};
// src/services/facetMapService.ts
export const facetMapService = {
    getMap: () => {
        return { 'Fire 1': 'Visionary', 'Water 2': 'Alchemist' };
    },
};
// src/services/facilitatorService.ts
export const facilitatorService = {
    getFacilitatorTools: () => {
        return ['Circle Process', 'Check-in Protocol', 'Conflict Resolution'];
    },
};
const feedbackList = [];
export const feedbackService = {
    submitFeedback: (feedback) => {
        feedbackList.push(feedback);
    },
    listFeedback: () => {
        return feedbackList;
    },
};
// src/services/flowService.ts
export const flowService = {
    startFlow: (userId) => {
        return `Flow started for ${userId}`;
    },
};
const insightLog = [];
export const insightHistoryService = {
    recordInsight: (insight) => {
        insightLog.push(insight);
    },
    getHistory: (userId) => {
        return insightLog.filter(i => i.userId === userId);
    },
};
// src/services/notionIngestService.ts
export const notionIngestService = {
    ingest: (content) => {
        return `Content ingested to Notion: ${content.substring(0, 50)}...`;
    },
};
const responses = [];
export const surveyService = {
    submitResponse: (response) => {
        responses.push(response);
    },
    getResponses: () => {
        return responses;
    },
};
// src/services/symbolicTrendsService.ts
export const symbolicTrendsService = {
    analyzeSymbols: (symbols) => {
        return `Trends show increased presence of: ${symbols.join(', ')}`;
    },
};
// src/services/oracleService.ts
export const oracleService = {
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
export const userService = {
    getUser: (id) => {
        return users[id] || null;
    },
    isAdmin: (id) => {
        return users[id]?.role === 'admin';
    },
};
const mockSessions = [];
export const sessionService = {
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
export const memoryService = {
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
export const dreamService = {
    record: (dream) => {
        dreams.push(dream);
        return dream;
    },
    interpret: (dream) => {
        return `The dream contains ${dream.symbols?.join(', ') || 'no symbols'}, revealing hidden archetypes.`;
    },
};
