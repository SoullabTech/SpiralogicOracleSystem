import { supabase } from "./supabase";
import { logger } from "./logger";

export interface UserOnboardingState {
  userId: string;
  isLoggedIn: boolean;
  isOnboarded: boolean;
  persona?: "mentor" | "shaman" | "analyst";
  intention?: string;
}

/**
 * Get user onboarding state from database
 * TODO: Replace with real authentication check
 */
export async function getUserOnboardingState(userId?: string): Promise<UserOnboardingState> {
  try {
    // For development - use mock user ID if not provided
    const mockUserId = userId || "mock-user-id";
    
    const { data, error } = await supabase
      .from("user_profiles")
      .select("persona, intention, onboarded")
      .eq("user_id", mockUserId)
      .single();

    if (error && error.code !== "PGRST116") {
      logger.error("Error fetching user onboarding state", { error, userId: mockUserId });
      return {
        userId: mockUserId,
        isLoggedIn: false,
        isOnboarded: false,
      };
    }

    return {
      userId: mockUserId,
      isLoggedIn: true, // TODO: Replace with real auth check
      isOnboarded: data?.onboarded || false,
      persona: data?.persona,
      intention: data?.intention,
    };
  } catch (error) {
    logger.error("getUserOnboardingState error", { error, userId });
    return {
      userId: userId || "mock-user-id",
      isLoggedIn: false,
      isOnboarded: false,
    };
  }
}

/**
 * Mock authentication middleware for development
 * TODO: Replace with real JWT/session authentication
 */
export function mockAuthMiddleware(req: any, res: any, next: any) {
  // For development, always set a mock user
  req.user = {
    id: "mock-user-id",
    email: "dev@example.com",
  };
  next();
}

export async function isAdmin(userId: string): Promise<boolean> {
  try {
    // Check if user has admin role
    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role_id")
      .eq("user_id", userId)
      .single();

    if (rolesError || !roles) {
      return false;
    }

    // Verify the role is admin
    const { data: roleType, error: roleTypeError } = await supabase
      .from("role_types")
      .select("name")
      .eq("id", roles.role_id)
      .single();

    return !roleTypeError && roleType?.name === "admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}
