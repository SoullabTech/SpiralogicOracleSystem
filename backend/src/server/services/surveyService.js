// src/services/surveyService.ts
const responses = [];
export const surveyService = {
    submitResponse: (response) => {
        responses.push(response);
    },
    getResponses: () => {
        return responses;
    },
};
