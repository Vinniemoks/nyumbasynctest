import { useTenant } from '../context/TenantContext';
import { useMemo } from 'react';

export const useLease = () => {
  const { lease, loading, error, refreshLease } = useTenant();

  // Calculate days until rent is due (assuming rent is due on the 1st of each month)
  const daysUntilRent = useMemo(() => {
    if (!lease) return 0;
    
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const diffTime = nextMonth - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }, [lease]);

  // Calculate days until lease ends
  const daysUntilEnd = useMemo(() => {
    if (!lease?.endDate) return 0;
    
    const today = new Date();
    const endDate = new Date(lease.endDate);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  }, [lease]);

  return {
    lease: lease ? {
      ...lease,
      daysUntilRent,
      daysUntilEnd
    } : null,
    loading,
    error,
    refresh: refreshLease
  };
};
