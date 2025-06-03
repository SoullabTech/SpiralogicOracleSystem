"use strict";
// src/services/surveyService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.surveyService = void 0;
const responses = [];
exports.surveyService = {
    submitResponse: (response) => {
        responses.push(response);
    },
    getResponses: () => {
        return responses;
    },
};
