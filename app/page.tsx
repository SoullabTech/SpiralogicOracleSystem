import { redirect } from "next/navigation";
import { getUserOnboardingState } from "@/lib/onboarding";

export default function Home() {
  const { isLoggedIn, isOnboarded } = getUserOnboardingState();

  if (!isLoggedIn || !isOnboarded) redirect("/welcome");
  redirect("/oracle");
}
