"use strict";
// src/services/surveyService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.surveyService = void 0;
const responses = [];
exports.surveyService = {
    /**
     * Store a single survey response
     */
    submitResponse: (response) => {
        responses.push(response);
    },
    /**
     * Retrieve all stored survey responses
     */
    getResponses: () => {
        return responses;
    },
    /**
     * Clear all responses (optional utility for testing/dev)
     */
    reset: () => {
        responses.length = 0;
    },
};
