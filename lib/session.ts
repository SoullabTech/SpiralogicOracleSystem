import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export interface Session {
  id: string;
  userId: string;
  createdAt: number;
  lastActivity: number;
}

export async function getSession(request: NextRequest): Promise<Session> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session');

  if (sessionCookie) {
    try {
      return JSON.parse(sessionCookie.value);
    } catch (e) {
      // Invalid session cookie
    }
  }

  // Create new session
  const session: Session = {
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    lastActivity: Date.now()
  };

  return session;
}

export function createSessionCookie(session: Session): string {
  return JSON.stringify(session);
}