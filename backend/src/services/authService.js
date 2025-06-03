"use strict";
// oracle-backend/src/services/authService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.refreshSession = refreshSession;
exports.logout = logout;
const supabaseClient_1 = require("../lib/supabaseClient");
/**
 * Handles user authentication and returns access and refresh tokens.
 */
async function login(authRequest) {
    const { email, password } = authRequest;
    const { data: { user, session }, error, } = await supabaseClient_1.supabase.auth.signInWithPassword({ email, password });
    if (error || !user || !session) {
        throw new Error(error?.message || 'Authentication failed');
    }
    return {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        user: {
            id: user.id,
            email: user.email ?? '',
        },
    };
}
/**
 * Refreshes the session using a refresh token.
 */
async function refreshSession(refreshToken) {
    const { data: { session }, error, } = await supabaseClient_1.supabase.auth.refreshSession({ refresh_token: refreshToken });
    if (error || !session || !session.user) {
        throw new Error(error?.message || 'Invalid refresh token');
    }
    return {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        user: {
            id: session.user.id,
            email: session.user.email ?? '',
        },
    };
}
/**
 * Logs out the user and ends the session.
 */
async function logout() {
    const { error } = await supabaseClient_1.supabase.auth.signOut();
    if (error) {
        throw new Error(error.message);
    }
}
