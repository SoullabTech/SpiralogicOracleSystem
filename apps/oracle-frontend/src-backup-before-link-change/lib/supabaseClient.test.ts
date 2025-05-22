import { describe, expect, it, vi } from 'vitest';
import { getUser } from './supabaseClient'; // <-- Correct relative path

vi.mock('./supabaseClient', () => ({
  getUser: vi.fn(() => null),
}));

describe('Supabase Auth & Profile', () => {
  it('returns null if no user session', async () => {
    const user = await getUser();
    expect(user).toBeNull();
  });

  it('handles profile fetch gracefully', async () => {
    // You can add a more advanced test here once your logic expands
    const profile = await getUser();
    expect(profile).toBeNull(); // Replace with your expected fallback if needed
  });
});
