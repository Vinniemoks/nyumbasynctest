import React from 'react';
import { usePermissions } from '../hooks/usePermissions';

/**
 * Component to conditionally render children based on permissions
 * Follows the principle of least privilege
 */
const PermissionGuard = ({ 
  permission, 
  permissions, 
  requireAll = false, 
  children, 
  fallback = null 
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  let hasAccess = false;

  if (permission) {
    // Single permission check
    hasAccess = hasPermission(permission);
  } else if (permissions && Array.isArray(permissions)) {
    // Multiple permissions check
    hasAccess = requireAll 
      ? hasAllPermissions(permissions) 
      : hasAnyPermission(permissions);
  }

  if (!hasAccess) {
    return fallback;
  }

  return <>{children}</>;
};

export default PermissionGuard;
