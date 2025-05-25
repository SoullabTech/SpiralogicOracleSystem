// src/pages/ProfilePage.tsx

import React from 'react';
import ProfileUpdateForm from '../components/ProfileUpdateForm';

const ProfilePage = () => {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold my-8">User Profile</h1>
      <ProfileUpdateForm />
    </div>
  );
};

export default ProfilePage;
