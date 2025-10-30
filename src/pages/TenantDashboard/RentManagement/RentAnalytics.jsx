import { useState, useEffect } from 'react';
import { TrendingUp, Calendar, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import apiService from '../../../api/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const RentAnalytics = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('bar');

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/tenant/rent/history');
      setPayments(response);
    } catch (error) {
      console.error('Error fetching payment data:', error);
      // Use mock data as fallback
      setPayments(generateMockPayments());
    } finally {
      setLoading(false);
    }
  };

  const generateMockPayments = () => {
    const mockPayments = [];
    const today = new Date();
    
    // Generate 12 months of payment history
    for (let i = 0; i < 12; i++) {
      const paymentDate = new Date(today.getFullYear(), today.getMonth() - i, 5);
      const dueDate = new Date(today.getFullYear(), today.getMonth() - i, 5);
      const actualPaymentDate = new Date(today.getFullYear(), today.getMonth() - i, Math.random() > 0.3 ? Math.floor(Math.random() * 5) + 1 : Math.floor(Math.random() * 10) + 6);
      
      mockPayments.push({
        id: i + 1,
        amount: 50000,
        paymentDate: actualPaymentDate.toISOString(),
        dueDate: dueDate.toISOString(),
        paymentMethod: ['mpesa', 'airtel', 'card', 'telkom'][Math.floor(Math.random() * 4)],
        transactionReference: `TXN-${Date.now() - i * 1000000}`,
        status: 'completed',
        onTime: actualPaymentDate <= dueDate,
      });
    }
    
    return mockPayments.reverse();
  };

  const getLast12MonthsData = () => {
    const months = [];
    const amounts = [];
    const today = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      months.push(monthName);
      
      const monthPayments = payments.filter(p => {
        const paymentDate = new Date(p.paymentDate);
        return paymentDate.getMonth() === date.getMonth() && 
               paymentDate.getFullYear() === date.getFullYear();
      });
      
      const totalAmount = monthPayments.reduce((sum, p) => sum + p.amount, 0);
      amounts.push(totalAmount);
    }
    
    return { months, amounts };
  };

  const calculateOnTimePercentage = () => {
    if (payments.length === 0) return 0;
    
    const onTimePayments = payments.filter(payment => {
      const paymentDate = new Date(payment.paymentDate);
      const dueDate = new Date(payment.dueDate);
      return paymentDate <= dueDate;
    });
    
    return Math.round((onTimePayments.length / payments.length) * 100);
  };

  const getPaymentMethodBreakdown = () => {
    const breakdown = {
      mpesa: 0,
      airtel: 0,
      telkom: 0,
      card: 0,
    };
    
    payments.forEach(payment => {
      if (breakdown.hasOwnProperty(payment.paymentMethod)) {
        breakdown[payment.paymentMethod]++;
      }
    });
    
    return breakdown;
  };

  const { months, amounts } = getLast12MonthsData();
  const onTimePercentage = calculateOnTimePercentage();
  const paymentMethodBreakdown = getPaymentMethodBreakdown();

  const barChartData = {
    labels: months,
    datasets: [
      {
        label: 'Rent Payments (KES)',
        data: amounts,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const lineChartData = {
    labels: months,
    datasets: [
      {
        label: 'Rent Payments (KES)',
        data: amounts,
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
      },
    ],
  };

  const doughnutChartData = {
    labels: ['M-Pesa', 'Airtel Money', 'Telkom Money', 'Credit/Debit Card'],
    datasets: [
      {
        data: [
          paymentMethodBreakdown.mpesa,
          paymentMethodBreakdown.airtel,
          paymentMethodBreakdown.telkom,
          paymentMethodBreakdown.card,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(59, 130, 246, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(59, 130, 246, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += 'KES ' + context.parsed.y.toLocaleString();
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return 'KES ' + value.toLocaleString();
          }
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} payments (${percentage}%)`;
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-3xl font-bold text-green-600">{onTimePercentage}%</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">On-Time Payments</h3>
          <p className="text-xs text-gray-500 mt-1">
            {payments.filter(p => {
              const paymentDate = new Date(p.paymentDate);
              const dueDate = new Date(p.dueDate);
              return paymentDate <= dueDate;
            }).length} of {payments.length} payments
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-3xl font-bold text-blue-600">
              {amounts.filter(a => a > 0).length}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Total Payments</h3>
          <p className="text-xs text-gray-500 mt-1">Last 12 months</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-3xl font-bold text-purple-600">
              KES {(amounts.reduce((a, b) => a + b, 0) / amounts.filter(a => a > 0).length || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Average Payment</h3>
          <p className="text-xs text-gray-500 mt-1">Per month</p>
        </div>
      </div>

      {/* Payment Trends Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Payment Trends</h3>
            <p className="text-sm text-gray-600 mt-1">12-month payment history</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setChartType('bar')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                chartType === 'bar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Bar Chart
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                chartType === 'line'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Line Chart
            </button>
          </div>
        </div>
        <div className="h-80">
          {chartType === 'bar' ? (
            <Bar data={barChartData} options={chartOptions} />
          ) : (
            <Line data={lineChartData} options={chartOptions} />
          )}
        </div>
      </div>

      {/* Payment Method Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Method Usage</h3>
          <div className="h-64">
            <Doughnut data={doughnutChartData} options={doughnutOptions} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Insights</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg mt-1">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Excellent Payment Record</h4>
                <p className="text-sm text-gray-600 mt-1">
                  You've maintained a {onTimePercentage}% on-time payment rate over the last 12 months.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg mt-1">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Consistent Payments</h4>
                <p className="text-sm text-gray-600 mt-1">
                  You've made {amounts.filter(a => a > 0).length} payments in the last 12 months.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg mt-1">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Preferred Method</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {Object.entries(paymentMethodBreakdown).reduce((a, b) => 
                    paymentMethodBreakdown[a[0]] > paymentMethodBreakdown[b[0]] ? a : b
                  )[0].toUpperCase()} is your most used payment method.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentAnalytics;
