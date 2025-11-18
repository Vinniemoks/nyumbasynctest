// Custom hook for permission checking
import { useAuth } from '../context/AuthContext';
import { hasPermission, hasAnyPermission, hasAllPermissions, isAdminRole } from '../config/adminRoles';

export const usePermissions = () => {
  const { user } = useAuth();
  const userRole = user?.role;

  const checkPermission = (permission) => {
    if (!userRole) return false;
    return hasPermission(userRole, permission);
  };

  const checkAnyPermission = (permissionList) => {
    if (!userRole) return false;
    return hasAnyPermission(userRole, permissionList);
  };

  const checkAllPermissions = (permissionList) => {
    if (!userRole) return false;
    return hasAllPermissions(userRole, permissionList);
  };

  const isAdmin = () => {
    if (!userRole) return false;
    return isAdminRole(userRole);
  };

  return {
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    isAdmin,
    userRole
  };
};

export default usePermissions;
