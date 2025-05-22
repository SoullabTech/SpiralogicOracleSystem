// src/components/ProfileUpdateForm.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Use axios or fetch for API calls
import { useAuth } from '../hooks/useAuth'; // Assuming you have an authentication hook

interface CrystalFocus {
  type: 'career' | 'spiritual' | 'relational' | 'health' | 'creative' | 'other';
  customDescription?: string;
  challenges: string;
  aspirations: string;
}

interface ProfileFormData {
  fire: number;
  water: number;
  earth: number;
  air: number;
  aether: number;
  crystal_focus: CrystalFocus;
}

const ProfileUpdateForm = () => {
  const { user } = useAuth(); // Assume you have an auth context
  const [profileData, setProfileData] = useState<ProfileFormData>({
    fire: 0,
    water: 0,
    earth: 0,
    air: 0,
    aether: 0,
    crystal_focus: {
      type: 'career',
      challenges: '',
      aspirations: '',
    },
  });

  useEffect(() => {
    if (user) {
      // Fetch the current profile data for the logged-in user
      axios
        .get(`/api/user-profile/${user.id}`)
        .then(response => {
          setProfileData(response.data); // Assuming the data format matches ProfileFormData
        })
        .catch(error => {
          console.error('Failed to fetch profile data:', error);
        });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Send the updated profile data to the backend for saving
      const response = await axios.post('/api/update-profile', profileData);
      console.log('Profile updated successfully:', response.data);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold text-center mb-6">Update Your Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Fire */}
          <div>
            <label htmlFor="fire" className="block text-sm font-medium text-gray-700">
              Fire
            </label>
            <input
              type="number"
              id="fire"
              name="fire"
              value={profileData.fire}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min={0}
              max={100}
            />
          </div>

          {/* Water */}
          <div>
            <label htmlFor="water" className="block text-sm font-medium text-gray-700">
              Water
            </label>
            <input
              type="number"
              id="water"
              name="water"
              value={profileData.water}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min={0}
              max={100}
            />
          </div>

          {/* Earth */}
          <div>
            <label htmlFor="earth" className="block text-sm font-medium text-gray-700">
              Earth
            </label>
            <input
              type="number"
              id="earth"
              name="earth"
              value={profileData.earth}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min={0}
              max={100}
            />
          </div>

          {/* Air */}
          <div>
            <label htmlFor="air" className="block text-sm font-medium text-gray-700">
              Air
            </label>
            <input
              type="number"
              id="air"
              name="air"
              value={profileData.air}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min={0}
              max={100}
            />
          </div>

          {/* Aether */}
          <div>
            <label htmlFor="aether" className="block text-sm font-medium text-gray-700">
              Aether
            </label>
            <input
              type="number"
              id="aether"
              name="aether"
              value={profileData.aether}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min={0}
              max={100}
            />
          </div>
        </div>

        {/* Crystal Focus */}
        <div>
          <label htmlFor="challenges" className="block text-sm font-medium text-gray-700">
            Challenges
          </label>
          <textarea
            id="challenges"
            name="challenges"
            value={profileData.crystal_focus.challenges}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
          />

          <label htmlFor="aspirations" className="block text-sm font-medium text-gray-700 mt-4">
            Aspirations
          </label>
          <textarea
            id="aspirations"
            name="aspirations"
            value={profileData.crystal_focus.aspirations}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div className="flex justify-end mt-8">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Update Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileUpdateForm;
