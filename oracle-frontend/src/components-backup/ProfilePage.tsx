// src/components/ProfilePage.tsx
import { useEffect, useState } from 'react';
import { getUserProfile, updateUserProfile, getProfileStats } from '../services/profileService';

const ProfilePage = () => {
  const [profile, setProfile] = useState<ElementalProfile | null>(null);
  const [profileStats, setProfileStats] = useState<{ fire: number; water: number; earth: number; air: number; aether: number } | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      const userProfile = await getUserProfile('user-id');
      const stats = await getProfileStats('user-id');

      setProfile(userProfile);
      setProfileStats(stats);
    };

    fetchProfileData();
  }, []);

  return (
    <div>
      {/* Display profile data */}
    </div>
  );
};

export default ProfilePage;
