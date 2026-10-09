import React, { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { RoleName } from '../../types';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: RoleName[];
  permissions?: string[];
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  roles,
  permissions,
  fallback,
}) => {
  const { isAuthenticated, isLoading, hasRole, hasPermission } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center text-secondary font-sans text-sm">
        Verifying judicial credentials...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      fallback || (
        <div className="p-8 text-center text-secondary font-sans">
          Authentication required. Please authenticate to access this administrative sector.
        </div>
      )
    );
  }

  if (roles && !hasRole(roles)) {
    return (
      fallback || (
        <div className="p-8 text-center text-status-danger font-sans">
          Access Restricted: Your assigned administrative role does not permit entry to this module.
        </div>
      )
    );
  }

  if (permissions && !hasPermission(permissions)) {
    return (
      fallback || (
        <div className="p-8 text-center text-status-danger font-sans">
          Access Restricted: Insufficient judicial authority privileges.
        </div>
      )
    );
  }

  return <>{children}</>;
};
