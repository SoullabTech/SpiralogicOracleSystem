// src/components/UserProfile.tsx
import React, { useEffect, useState } from 'react';
import { fetchUserProfile } from '../services/profileService';

const UserProfile = ({ userId }: { userId: string }) => {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const data = await fetchUserProfile(userId);
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    getProfile();
  }, [userId]);

  return (
    <div>
      {profile ? (
        <div>
          <h1>{profile.name}</h1>
          <p>{profile.email}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default UserProfile;
