// Location: /oracle-frontend/src/pages/rituals/ritual-router.tsx
// Build: Frontend

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentSpiralPhase } from '@/lib/spiralLogic'; // placeholder for real logic

const RitualRouter = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const phase = getCurrentSpiralPhase(); // e.g., returns "Fire 1", "Water 1", etc.

    switch (phase) {
      case 'Fire 1':
        navigate('/rituals/fire-initiation');
        break;
      case 'Water 1':
        navigate('/rituals/water-initiation');
        break;
      case 'Earth 1':
        navigate('/rituals/earth-initiation');
        break;
      case 'Air 1':
        navigate('/rituals/air-initiation');
        break;
      case 'Aether 1':
        navigate('/rituals/aether-initiation');
        break;
      default:
        navigate('/dashboard');
    }
  }, [navigate]);

  return null;
};

export default RitualRouter;
