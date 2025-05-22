// src/hooks/useDate.ts
import { useState } from 'react';

export function useDate() {
  const [date, setDate] = useState<Date>(new Date());
  return { date, setDate };
}
