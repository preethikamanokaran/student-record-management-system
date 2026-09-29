import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  onNavigate: (path: string) => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles, onNavigate }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    onNavigate('/login');
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    onNavigate('/unauthorized');
    return null;
  }

  return <>{children}</>;
};
