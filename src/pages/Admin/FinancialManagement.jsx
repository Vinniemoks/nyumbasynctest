import React, { useState, useEffect } from 'react';
import { PERMISSIONS } from '../../config/adminRoles';
import PermissionGuard from '../../components/PermissionGuard';
import adminApi from '../../api/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';

const FinancialManagement = () => {
  const [overview, setOverview] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
      const [overviewData, transactionsData] = await Promise.all([
        adminApi.getFinancialOverview(),
        adminApi.getPaymentTransactions({ limit: 20 })
      ]);
      setOverview(overviewData);
      setTransactions(transactionsData.transactions);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading financial data..." />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Financial Management</h1>
        <PermissionGuard permission={PERMISSIONS.EXPORT_FINANCIAL_DATA}>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            <i className="fas fa-download mr-2"></i>
            Export Report
          </button>
        </PermissionGuard>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-600 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">
            KES {overview?.totalRevenue?.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-600 text-sm">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600">
            KES {overview?.totalExpenses?.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-600 text-sm">Net Income</p>
          <p className="text-2xl font-bold text-blue-600">
            KES {overview?.netIncome?.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-600 text-sm">Pending Payments</p>
          <p className="text-2xl font-bold text-yellow-600">
            KES {overview?.pendingPayments?.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((txn) => (
                <tr key={txn.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{txn.transactionId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{txn.tenant}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                    KES {txn.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">{txn.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      txn.status === 'completed' ? 'bg-green-100 text-green-800' :
                      txn.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(txn.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancialManagement;
