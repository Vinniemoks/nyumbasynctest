import { useTenant } from '../context/TenantContext';

export const useProperty = () => {
  const { property, loading, error, refreshProperty } = useTenant();

  return {
    property,
    loading,
    error,
    refresh: refreshProperty
  };
};
