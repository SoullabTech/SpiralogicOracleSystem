/**
 * Domain Types for Authentication
 * Pure domain concepts without infrastructure dependencies
 */

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
  };
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  accountType: "user" | "professional" | "mentor" | "researcher" | "admin";
  createdAt: Date;
  lastActive: Date;
}

export interface Session {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
}