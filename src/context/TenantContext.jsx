import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import apiService from '../api/api';

const TenantContext = createContext(null);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
};

export const TenantProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [tenant, setTenant] = useState(null);
  const [property, setProperty] = useState(null);
  const [lease, setLease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'tenant') {
      fetchTenantData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchTenantData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch tenant profile
      const tenantData = await apiService.getTenantProfile();
      setTenant(tenantData);

      // Fetch current property
      if (tenantData.currentPropertyId) {
        const propertyData = await apiService.getProperty(tenantData.currentPropertyId);
        setProperty(propertyData);
      }

      // Fetch lease information
      if (tenantData.currentLeaseId) {
        const leaseData = await apiService.getLease(tenantData.currentLeaseId);
        setLease(leaseData);
      }
    } catch (err) {
      console.error('Failed to fetch tenant data:', err);
      setError(err.message || 'Failed to load tenant data');
    } finally {
      setLoading(false);
    }
  };

  const refreshTenant = async () => {
    try {
      const tenantData = await apiService.getTenantProfile();
      setTenant(tenantData);
    } catch (err) {
      console.error('Failed to refresh tenant data:', err);
    }
  };

  const refreshProperty = async () => {
    try {
      if (tenant?.currentPropertyId) {
        const propertyData = await apiService.getProperty(tenant.currentPropertyId);
        setProperty(propertyData);
      }
    } catch (err) {
      console.error('Failed to refresh property data:', err);
    }
  };

  const refreshLease = async () => {
    try {
      if (tenant?.currentLeaseId) {
        const leaseData = await apiService.getLease(tenant.currentLeaseId);
        setLease(leaseData);
      }
    } catch (err) {
      console.error('Failed to refresh lease data:', err);
    }
  };

  const refreshAll = async () => {
    await fetchTenantData();
  };

  const value = {
    tenant,
    property,
    lease,
    loading,
    error,
    refreshTenant,
    refreshProperty,
    refreshLease,
    refreshAll
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};
