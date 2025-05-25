import { useEffect, useState } from 'react';
import SpiralBreathPortal from '@/components/SpiralBreathPortal/SpiralBreathPortal';
import LoadingSpinner from '@/components/ui/LoadingSpinner'; // <-- Optional: smooth loading UX
import { getCurrentUserId } from '@/services/authService'; // <-- Future dynamic auth

export default function SpiralPortalPage() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Simulate fetching authenticated user id (can be updated for real auth)
    const fetchUserId = async () => {
      const id = await getCurrentUserId();
      setUserId(id ?? 'currentUser'); // fallback if auth not ready yet
    };
    fetchUserId();
  }, []);

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-soullab-mist via-soullab-aether to-soullab-twilight animate-fade-in">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-soullab-mist via-soullab-aether to-soullab-twilight animate-fade-in p-8">
      <SpiralBreathPortal userId={userId} />
    </div>
  );
}
