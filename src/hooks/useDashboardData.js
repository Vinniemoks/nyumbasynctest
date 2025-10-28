import { useState, useEffect } from 'react';
import apiService from '../api/api';

export const useDashboardData = (role) => {
  const [data, setData] = useState({
    properties: [],
    tenants: [],
    payments: [],
    maintenance: [],
    stats: {},
    loading: true,
    error: null
  });

  useEffect(() => {
    fetchDashboardData();
  }, [role]);

  const fetchDashboardData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      const [properties, tenants, payments, maintenance] = await Promise.all([
        apiService.getProperties().catch(() => []),
        apiService.getTenants().catch(() => []),
        apiService.getRentPayments().catch(() => []),
        apiService.getMaintenanceRequests().catch(() => [])
      ]);

      const stats = calculateStats(role, { properties, tenants, payments, maintenance });

      setData({
        properties,
        tenants,
        payments,
        maintenance,
        stats,
        loading: false,
        error: null
      });
    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  };

  const calculateStats = (role, data) => {
    const stats = {};
    
    if (role === 'landlord') {
      stats.totalProperties = data.properties.length;
      stats.totalIncome = data.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      stats.vacancies = data.properties.filter(p => !p.occupied).length;
      stats.maintenanceRequests = data.maintenance.filter(m => m.status === 'pending').length;
    } else if (role === 'manager') {
      stats.portfolioSize = data.properties.length;
      stats.rentCollected = data.payments.filter(p => p.status === 'paid').length;
      stats.totalRent = data.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      stats.activeMaintenance = data.maintenance.filter(m => m.status === 'in_progress').length;
    } else if (role === 'tenant') {
      stats.rentDue = data.payments.find(p => p.status === 'pending')?.amount || 0;
      stats.maintenanceActive = data.maintenance.filter(m => m.status !== 'completed').length;
      stats.daysUntilRent = calculateDaysUntilRent(data.payments);
    }
    
    return stats;
  };

  const calculateDaysUntilRent = (payments) => {
    const nextPayment = payments.find(p => p.status === 'pending');
    if (!nextPayment) return 0;
    const dueDate = new Date(nextPayment.dueDate);
    const today = new Date();
    return Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
  };

  const refresh = () => fetchDashboardData();

  return { ...data, refresh };
};
