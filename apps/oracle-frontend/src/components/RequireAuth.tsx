import { Navigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';

export function RequireAuth({ children }: { children: JSX.Element }) {
  const { session, loading } = useSession();

  if (loading) {
    return <div>Loading...</div>; // Optional: show spinner
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
