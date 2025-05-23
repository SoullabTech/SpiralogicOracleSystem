// /lib/hooks/usePersonalOracle.ts
import { useState } from 'react';
import axios from 'axios';

export const usePersonalOracle = () => {
  const [oracleData, setOracleData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchOracle = async ({ userId, userName, tone }) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/oracle/personal', { userId, userName, tone });
      setOracleData(res.data);
    } catch (err) {
      console.error('Personal Oracle Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { oracleData, fetchOracle, loading };
};
