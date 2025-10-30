import { useTenant } from '../context/TenantContext';

export const useTenantProfile = () => {
  const { tenant, loading, error, refreshTenant } = useTenant();

  return {
    tenant,
    loading,
    error,
    refresh: refreshTenant
  };
};
