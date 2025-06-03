"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPersonalOracleResponse = getPersonalOracleResponse;
// backend/src/services/personalOracleService.ts
const oracle_1 = require("@/core/oracle"); // adjust import
async function getPersonalOracleResponse(userId, tone) {
    // implement your oracle query logic here
    const response = await (0, oracle_1.someBackendLogic)(userId, tone);
    return response;
}
