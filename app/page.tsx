import { redirect } from "next/navigation";
import { getUserOnboardingState } from "../lib/onboarding";
import HomePage from "./home/page";

export default function Home() {
  const { isLoggedIn, isOnboarded } = getUserOnboardingState();

  if (!isLoggedIn || !isOnboarded) redirect("/welcome");
  
  // Show home page instead of redirecting to oracle
  return <HomePage />;
}
