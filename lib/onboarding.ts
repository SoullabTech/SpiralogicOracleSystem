// Server helpers for onboarding state (cookie-based for MVP).
import { cookies } from "next/headers";

export type OnboardingState = {
  isLoggedIn: boolean;
  isOnboarded: boolean;
  persona?: "mentor" | "shaman" | "analyst";
  intention?: string;
};

// TODO: Replace with real auth check when ready.
function readIsLoggedInCookie(): boolean {
  const c = cookies().get("auth")?.value;
  return c === "1";
}

export function getUserOnboardingState(): OnboardingState {
  const store = cookies();
  const isLoggedIn = readIsLoggedInCookie();
  const isOnboarded = store.get("onboarded")?.value === "1";
  const persona = store.get("persona")?.value as OnboardingState["persona"] | undefined;
  const intention = store.get("intention")?.value;

  return { isLoggedIn, isOnboarded, persona, intention };
}