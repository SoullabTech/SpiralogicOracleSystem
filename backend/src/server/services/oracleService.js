"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOracleQuery = void 0;
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const sendOracleQuery = async (input) => {
    const res = await fetch(`${BASE_URL}/api/oracle/query`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
    });
    return res.json();
};
exports.sendOracleQuery = sendOracleQuery;
