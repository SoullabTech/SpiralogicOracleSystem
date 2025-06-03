"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
exports.supabase = {
    auth: {
        signInWithPassword: async ({ email, password }) => {
            console.log(`[Mock Supabase] signIn called with: ${email}, ${password}`);
            return {
                user: {
                    id: 'mock-user-id',
                    email,
                    user_metadata: { role: 'client' }
                },
                session: {
                    user: {
                        id: 'mock-user-id',
                        email,
                        user_metadata: { role: 'client' }
                    }
                },
                error: null
            };
        },
        signOut: async () => ({ error: null }),
    },
    from: () => ({
        select: async () => ({ data: [], error: null }),
        insert: async (payload) => ({ data: [payload], error: null }),
        update: async (changes) => ({ data: [changes], error: null }),
        delete: async () => ({ data: [], error: null }),
    }),
};
