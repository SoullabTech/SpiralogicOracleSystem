export interface IProfileService {
  getUserProfile(userId: string): Promise<any>;
  updateProfile(userId: string, profile: any): Promise<any>;
}