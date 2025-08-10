import type { AuthResponse } from "../types";

export const supabase = {
  auth: {
    signInWithPassword: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }): Promise<AuthResponse> => {
      console.log(`[Mock Supabase] signIn called with: ${email}, ${password}`);
      return {
        user: {
          id: "mock-user-id",
          email,
          user_metadata: { role: "client" } as any,
        },
        session: {
          user: {
            id: "mock-user-id",
            email,
            user_metadata: { role: "client" } as any,
          },
        },
        error: null,
      };
    },
    signOut: async () => ({ error: null }),
  },
  from: () => ({
    select: async () => ({ data: [], error: null }),
    insert: async (payload: any) => ({ data: [payload], error: null }),
    update: async (changes: any) => ({ data: [changes], error: null }),
    delete: async () => ({ data: [], error: null }),
  }),
};
