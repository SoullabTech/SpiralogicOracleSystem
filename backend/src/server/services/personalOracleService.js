// backend/src/services/personalOracleService.ts
import { someBackendLogic } from '@/core/oracle'; // adjust import
export async function getPersonalOracleResponse(userId, tone) {
    // implement your oracle query logic here
    const response = await someBackendLogic(userId, tone);
    return response;
}
