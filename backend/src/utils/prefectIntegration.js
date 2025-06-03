"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prefectTriggerFlow = prefectTriggerFlow;
const axios_1 = __importDefault(require("axios"));
async function prefectTriggerFlow(flowName, payload) {
    try {
        const response = await axios_1.default.post('https://api.prefect.io', {
            flow_name: flowName,
            payload: payload,
        });
        return response.data;
    }
    catch (error) {
        console.error("Failed to trigger Prefect flow:", error);
        throw error;
    }
}
