export function usePersonalOracle() {
  const [oracleData, setOracleData] = useState(null);
  const [loading, setLoading] = useState(false);

  async function fetchOracleReflection() {
    setLoading(true);
    const res = await fetch('/api/oracle/personal');
    const data = await res.json();
    setOracleData(data);
    setLoading(false);
  }

  return { oracleData, loading, fetchOracleReflection };
}
