// src/contexts/SwissEphContext.tsx
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { SwissEphModule } from '@/lib/swisseph';
import { initSwissEph } from '@/lib/swisseph';

interface SwissEphContextValue {
  swe: SwissEphModule | null;
  loading: boolean;
  error: Error | null;
}

const SwissEphContext = createContext<SwissEphContextValue>({
  swe: null,
  loading: true,
  error: null,
});

export function SwissEphProvider({ children }: { children: ReactNode }) {
  const [swe, setSwe] = useState<SwissEphModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    initSwissEph()
      .then((mod) => setSwe(mod))
      .catch((err) => setError(err as Error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SwissEphContext.Provider value={{ swe, loading, error }}>
      {children}
    </SwissEphContext.Provider>
  );
}

export function useSwissEph() {
  return useContext(SwissEphContext);
}
