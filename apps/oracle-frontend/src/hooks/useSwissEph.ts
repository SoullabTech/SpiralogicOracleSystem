// src/hooks/useSwissEph.ts
import { initSwissEph, SwissEphModule } from '@lib/swisseph';
import { useEffect, useState } from 'react';

export function useSwissEph() {
  const [swe, setSwe] = useState<SwissEphModule | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    initSwissEph()
      .then(setSwe)
      .catch(setError);
  }, []);

  return { swe, error };
}
