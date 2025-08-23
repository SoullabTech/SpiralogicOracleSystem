import type { IProfileService } from "@/lib/shared/interfaces/IProfileService";
import { getUserProfile } from "../profileService";

export class ProfileServiceAdapter implements IProfileService {
  async getUserProfile(userId: string): Promise<any> {
    return getUserProfile(userId);
  }

  async updateProfile(userId: string, profile: any): Promise<any> {
    // This would be implemented when needed
    throw new Error("updateProfile not implemented yet");
  }
}

export const profileService = new ProfileServiceAdapter();