// 📁 src/components/shared/SaveBreathButton.tsx
import { useState } from 'react';

interface SaveBreathButtonProps {
  onSave: () => Promise<void>;
}

export default function SaveBreathButton({ onSave }: SaveBreathButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onSave();
    } catch (err) {
      console.error("Save error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center mt-6">
      <button
        onClick={handleClick}
        disabled={loading}
        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
      >
        {loading ? 'Saving...' : '🌬️ Save Today\'s Spiral Breath'}
      </button>
    </div>
  );
}
