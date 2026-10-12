import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>; // Could use Skeleton here later
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their respective dashboards if they try to access an unauthorized route
    if (user.role === 'EMPLOYEE') return <Navigate to="/employee/dashboard" replace />;
    if (user.role === 'DIRECTOR') return <Navigate to="/director/dashboard" replace />;
    if (user.role === 'ACCOUNTS') return <Navigate to="/accounts/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
