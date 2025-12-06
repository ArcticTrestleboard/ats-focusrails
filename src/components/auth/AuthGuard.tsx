import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your board...</p>
          </div>
        </div>
      )
    );
  }

  if (!user) {
    return null; // Handled by parent
  }

  return <>{children}</>;
}
