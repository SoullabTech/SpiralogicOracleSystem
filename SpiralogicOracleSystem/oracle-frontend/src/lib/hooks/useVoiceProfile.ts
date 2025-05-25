import { useAuth } from "@/context/AuthContext";
import { getVoiceProfile } from "@/lib/getVoiceProfile";
import { useMemo } from "react";

export function useVoiceProfile() {
  const { userProfile } = useAuth();
  const orgId = userProfile?.voice_profile ?? "default";

  const profile = useMemo(() => getVoiceProfile(orgId), [orgId]);
  return profile;
}
