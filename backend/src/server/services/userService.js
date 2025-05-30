// src/services/surveyService.ts
const responses = [];
export const surveyService = {
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
