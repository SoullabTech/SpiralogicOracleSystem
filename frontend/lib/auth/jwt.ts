import jwt from 'jsonwebtoken';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { sessionHelpers } from '../redis';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'spiralogic-oracle-secret-key-change-in-production';
const JWT_ALGORITHM = 'HS256';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// Convert string secret to Uint8Array for jose
const secret = new TextEncoder().encode(JWT_SECRET);

// User payload interface
export interface UserPayload {
  userId: string;
  email: string;
  role?: string;
  permissions?: string[];
}

// Token pair interface
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Generate JWT token pair
export async function generateTokenPair(payload: UserPayload): Promise<TokenPair> {
  // Generate access token
  const accessToken = await new SignJWT({ ...payload, type: 'access' })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .setSubject(payload.userId)
    .sign(secret);

  // Generate refresh token
  const refreshToken = await new SignJWT({ userId: payload.userId, type: 'refresh' })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRES_IN)
    .setSubject(payload.userId)
    .sign(secret);

  // Store refresh token in Redis
  await sessionHelpers.setSession(
    `refresh:${payload.userId}`,
    { refreshToken, email: payload.email },
    7 * 24 * 60 * 60 // 7 days
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: 24 * 60 * 60, // 24 hours in seconds
  };
}

// Verify JWT token
export async function verifyToken(token: string, tokenType: 'access' | 'refresh' = 'access'): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    
    // Check token type
    if (payload.type !== tokenType) {
      return null;
    }

    // For refresh tokens, check if it exists in Redis
    if (tokenType === 'refresh' && payload.sub) {
      const storedData = await sessionHelpers.getSession(`refresh:${payload.sub}`);
      if (!storedData || storedData.refreshToken !== token) {
        return null;
      }
    }

    return {
      userId: payload.sub!,
      email: payload.email as string,
      role: payload.role as string | undefined,
      permissions: payload.permissions as string[] | undefined,
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// Refresh access token
export async function refreshAccessToken(refreshToken: string): Promise<TokenPair | null> {
  const payload = await verifyToken(refreshToken, 'refresh');
  
  if (!payload) {
    return null;
  }

  // Get user data from Redis
  const sessionData = await sessionHelpers.getSession(`refresh:${payload.userId}`);
  if (!sessionData) {
    return null;
  }

  // Generate new token pair
  return generateTokenPair({
    userId: payload.userId,
    email: sessionData.email,
    role: sessionData.role,
    permissions: sessionData.permissions,
  });
}

// Revoke refresh token
export async function revokeRefreshToken(userId: string): Promise<void> {
  await sessionHelpers.deleteSession(`refresh:${userId}`);
}

// Set auth cookies
export function setAuthCookies(tokens: TokenPair) {
  const cookieStore = cookies();
  
  // Set access token cookie
  cookieStore.set('auth-token', tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: tokens.expiresIn,
    path: '/',
  });

  // Set refresh token cookie
  cookieStore.set('refresh-token', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

// Clear auth cookies
export function clearAuthCookies() {
  const cookieStore = cookies();
  cookieStore.delete('auth-token');
  cookieStore.delete('refresh-token');
}

// Get current user from request
export async function getCurrentUser(): Promise<UserPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

// Middleware helper for API routes
export async function withAuth(
  handler: (req: Request, user: UserPayload) => Promise<Response>
): Promise<(req: Request) => Promise<Response>> {
  return async (req: Request) => {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || 
                  req.headers.get('cookie')?.match(/auth-token=([^;]+)/)?.[1];

    if (!token) {
      return new Response('Unauthorized', { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return new Response('Invalid token', { status: 403 });
    }

    return handler(req, user);
  };
}

// Role-based access control
export function requireRole(allowedRoles: string[]) {
  return async (req: Request, user: UserPayload): Promise<Response | null> => {
    if (!user.role || !allowedRoles.includes(user.role)) {
      return new Response('Forbidden', { status: 403 });
    }
    return null;
  };
}

// Permission-based access control
export function requirePermission(requiredPermissions: string[]) {
  return async (req: Request, user: UserPayload): Promise<Response | null> => {
    if (!user.permissions || !requiredPermissions.every(p => user.permissions?.includes(p))) {
      return new Response('Forbidden', { status: 403 });
    }
    return null;
  };
}