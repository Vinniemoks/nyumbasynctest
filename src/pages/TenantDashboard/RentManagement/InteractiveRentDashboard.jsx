import { useState, useEffect } from 'react';
import { CreditCard, History, Download } from 'lucide-react';
import StatusBadge from '../../../components/shared/StatusBadge';
import { useTenant } from '../../../context/TenantContext';
import apiService from '../../../api/api';

const InteractiveRentDashboard = ({ onPayRent, onViewHistory, onDownloadReceipt }) => {
  const { lease } = useTenant();
  const [rentData, setRentData] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRentData();
    fetchPaymentHistory();
  }, []);

  const fetchRentData = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/tenant/rent/current');
      setRentData(response);
    } catch (error) {
      console.error('Error fetching rent data:', error);
      // Use mock data as fallback
      setRentData({
        amount: 50000,
        dueDate: '2025-11-05',
        status: 'due',
        propertyId: '1',
        lastPaymentDate: '2025-10-05',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const response = await apiService.get('/tenant/rent/history');
      setPaymentHistory(response);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      // Use mock data
      setPaymentHistory(generateMockPayments());
    }
  };

  const generateMockPayments = () => {
    const mockPayments = [];
    const today = new Date();
    
    for (let i = 0; i < 12; i++) {
      const paymentDate = new Date(today.getFullYear(), today.getMonth() - i, 5);
      mockPayments.push({
        id: i + 1,
        amount: 50000,
        paymentDate: paymentDate.toISOString(),
        dueDate: new Date(today.getFullYear(), today.getMonth() - i, 5).toISOString(),
        status: 'completed',
      });
    }
    
    return mockPayments;
  };

  const calculateDaysUntilDue = () => {
    if (!rentData) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(rentData.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
  };

  const calculateDaysLate = () => {
    const daysUntilDue = calculateDaysUntilDue();
    return daysUntilDue < 0 ? Math.abs(daysUntilDue) : 0;
  };

  const getStatusText = () => {
    if (!rentData) return 'Loading...';
    const daysUntilDue = calculateDaysUntilDue();
    const daysLate = calculateDaysLate();
    
    if (rentData.status === 'paid') return 'Paid';
    if (rentData.status === 'overdue') return `Overdue by ${daysLate} day${daysLate !== 1 ? 's' : ''}`;
    if (daysUntilDue === 0) return 'Due Today';
    if (daysUntilDue === 1) return 'Due Tomorrow';
    return `Due in ${daysUntilDue} days`;
  };

  const calculateLeaseProgress = () => {
    if (!lease) return { monthsPaid: 0, totalMonths: 0, percentage: 0 };
    
    const startDate = new Date(lease.startDate);
    const endDate = new Date(lease.endDate);
    const today = new Date();
    
    const totalMonths = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24 * 30));
    const monthsPaid = Math.floor((today - startDate) / (1000 * 60 * 60 * 24 * 30));
    const percentage = Math.min((monthsPaid / totalMonths) * 100, 100);
    
    return { monthsPaid: Math.max(0, monthsPaid), totalMonths, percentage: Math.max(0, percentage) };
  };

  const getLast12MonthsData = () => {
    const months = [];
    const amounts = [];
    const today = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      months.push(monthName);
      
      const monthPayments = paymentHistory.filter(p => {
        const paymentDate = new Date(p.paymentDate);
        return paymentDate.getMonth() === date.getMonth() && 
               paymentDate.getFullYear() === date.getFullYear();
      });
      
      const totalAmount = monthPayments.reduce((sum, p) => sum + p.amount, 0);
      amounts.push(totalAmount);
    }
    
    return { months, amounts };
  };

  const leaseProgress = calculateLeaseProgress();
  const { months, amounts } = getLast12MonthsData();
  const maxAmount = Math.max(...amounts, 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h3 className="text-lg font-semibold text-white">Interactive Rent Dashboard</h3>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Payment Status Indicator */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-2">Current Status</p>
            <StatusBadge 
              status={rentData.status} 
              size="lg" 
              customLabel={getStatusText()}
            />
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Monthly Rent</p>
            <p className="text-3xl font-bold text-gray-900">
              KES {rentData.amount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Lease Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Lease Progress</p>
            <p className="text-sm text-gray-600">
              {leaseProgress.monthsPaid} of {leaseProgress.totalMonths} months paid
            </p>
          </div>
          <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 rounded-full"
              style={{ width: `${leaseProgress.percentage}%` }}
            >
              <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1 text-right">
            {leaseProgress.percentage.toFixed(1)}% complete
          </p>
        </div>

        {/* Payment History Chart */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-700">12-Month Payment History</p>
            <button
              onClick={onViewHistory}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View Details →
            </button>
          </div>
          <div className="flex items-end justify-between gap-2 h-32">
            {amounts.map((amount, index) => {
              const height = (amount / maxAmount) * 100;
              const isPaid = amount > 0;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center h-24">
                    <div 
                      className={`w-full rounded-t transition-all duration-300 ${
                        isPaid 
                          ? 'bg-gradient-to-t from-green-500 to-green-400 hover:from-green-600 hover:to-green-500' 
                          : 'bg-gray-200'
                      }`}
                      style={{ height: `${height}%` }}
                      title={`${months[index]}: KES ${amount.toLocaleString()}`}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">{months[index]}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onPayRent}
            disabled={rentData.status === 'paid'}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              rentData.status === 'paid'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            Pay Rent
          </button>
          
          <button
            onClick={onViewHistory}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
          >
            <History className="w-5 h-5" />
            View History
          </button>
          
          <button
            onClick={onDownloadReceipt}
            disabled={!rentData.lastPaymentDate}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              rentData.lastPaymentDate
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Download className="w-5 h-5" />
            Download Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default InteractiveRentDashboard;
