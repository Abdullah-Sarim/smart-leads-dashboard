import { Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}