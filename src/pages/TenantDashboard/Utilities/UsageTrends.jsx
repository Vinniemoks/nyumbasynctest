import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import apiService from '../../../api/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const UsageTrends = () => {
  const navigate = useNavigate();
  const [selectedUtility, setSelectedUtility] = useState('electricity');
  const [chartType, setChartType] = useState('line');
  const [timeRange, setTimeRange] = useState(12);
  const [trendsData, setTrendsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrendsData();
  }, [selectedUtility, timeRange]);

  const fetchTrendsData = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUtilityUsageTrends(selectedUtility, timeRange);
      setTrendsData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching trends data:', err);
      setError('Failed to load usage trends. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getUtilityColor = (type) => {
    const colors = {
      water: { primary: 'rgb(59, 130, 246)', secondary: 'rgba(59, 130, 246, 0.1)' },
      electricity: { primary: 'rgb(234, 179, 8)', secondary: 'rgba(234, 179, 8, 0.1)' },
      internet: { primary: 'rgb(168, 85, 247)', secondary: 'rgba(168, 85, 247, 0.1)' },
      gas: { primary: 'rgb(249, 115, 22)', secondary: 'rgba(249, 115, 22, 0.1)' }
    };
    return colors[type] || colors.electricity;
  };

  const getChartData = () => {
    if (!trendsData || trendsData.length === 0) return null;

    const colors = getUtilityColor(selectedUtility);
    const labels = trendsData.map(item => item.month);
    const usageData = trendsData.map(item => item.usage);
    const costData = trendsData.map(item => item.amount);

    return {
      labels,
      datasets: [
        {
          label: `Usage (${trendsData[0]?.usageUnit || 'units'})`,
          data: usageData,
          borderColor: colors.primary,
          backgroundColor: chartType === 'line' ? colors.secondary : colors.primary,
          fill: chartType === 'line',
          tension: 0.4,
          yAxisID: 'y'
        },
        {
          label: 'Cost (KES)',
          data: costData,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: chartType === 'line' ? 'rgba(34, 197, 94, 0.1)' : 'rgb(34, 197, 94)',
          fill: chartType === 'line',
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.dataset.yAxisID === 'y1') {
              label += formatCurrency(context.parsed.y);
            } else {
              label += context.parsed.y + ' ' + (trendsData[0]?.usageUnit || 'units');
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: `Usage (${trendsData?.[0]?.usageUnit || 'units'})`
        },
        grid: {
          drawOnChartArea: true
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Cost (KES)'
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  };

  const calculateStats = () => {
    if (!trendsData || trendsData.length === 0) return null;

    const totalUsage = trendsData.reduce((sum, item) => sum + item.usage, 0);
    const totalCost = trendsData.reduce((sum, item) => sum + item.amount, 0);
    const avgUsage = totalUsage / trendsData.length;
    const avgCost = totalCost / trendsData.length;

    // Calculate month-over-month change
    const currentMonth = trendsData[trendsData.length - 1];
    const previousMonth = trendsData[trendsData.length - 2];
    const usageChange = previousMonth 
      ? ((currentMonth.usage - previousMonth.usage) / previousMonth.usage * 100).toFixed(1)
      : 0;
    const costChange = previousMonth
      ? ((currentMonth.amount - previousMonth.amount) / previousMonth.amount * 100).toFixed(1)
      : 0;

    return {
      totalUsage,
      totalCost,
      avgUsage,
      avgCost,
      usageChange,
      costChange,
      currentMonth,
      previousMonth
    };
  };

  const stats = calculateStats();
  const chartData = getChartData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">Loading usage trends...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <i className="fas fa-exclamation-circle text-red-500 text-4xl mb-4"></i>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchTrendsData}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/tenant-dashboard/utilities')}
          className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Utilities
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Usage Trends</h1>
        <p className="text-gray-600">Track your utility consumption patterns over time</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Utility Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Utility Type
            </label>
            <select
              value={selectedUtility}
              onChange={(e) => setSelectedUtility(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="electricity">Electricity</option>
              <option value="water">Water</option>
              <option value="internet">Internet</option>
              <option value="gas">Gas</option>
            </select>
          </div>

          {/* Chart Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chart Type
            </label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
            </select>
          </div>

          {/* Time Range Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Range
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="6">Last 6 Months</option>
              <option value="12">Last 12 Months</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Current Month</h3>
              <i className="fas fa-calendar-day text-blue-600"></i>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.currentMonth.usage} {stats.currentMonth.usageUnit}
            </p>
            <p className="text-sm text-gray-500 mt-1">{formatCurrency(stats.currentMonth.amount)}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Average Usage</h3>
              <i className="fas fa-chart-bar text-green-600"></i>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.avgUsage.toFixed(1)} {stats.currentMonth.usageUnit}
            </p>
            <p className="text-sm text-gray-500 mt-1">{formatCurrency(stats.avgCost)}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Usage Change</h3>
              <i className={`fas fa-arrow-${parseFloat(stats.usageChange) >= 0 ? 'up' : 'down'} ${parseFloat(stats.usageChange) >= 0 ? 'text-red-600' : 'text-green-600'}`}></i>
            </div>
            <p className={`text-2xl font-bold ${parseFloat(stats.usageChange) >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {stats.usageChange > 0 ? '+' : ''}{stats.usageChange}%
            </p>
            <p className="text-sm text-gray-500 mt-1">vs last month</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Cost Change</h3>
              <i className={`fas fa-arrow-${parseFloat(stats.costChange) >= 0 ? 'up' : 'down'} ${parseFloat(stats.costChange) >= 0 ? 'text-red-600' : 'text-green-600'}`}></i>
            </div>
            <p className={`text-2xl font-bold ${parseFloat(stats.costChange) >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {stats.costChange > 0 ? '+' : ''}{stats.costChange}%
            </p>
            <p className="text-sm text-gray-500 mt-1">vs last month</p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 capitalize">
          {selectedUtility} Usage & Cost Trends
        </h2>
        <div className="h-96">
          {chartData && (
            chartType === 'line' ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <Bar data={chartData} options={chartOptions} />
            )
          )}
        </div>
      </div>

      {/* Insights */}
      {stats && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Insights & Recommendations</h2>
          <div className="space-y-4">
            {parseFloat(stats.usageChange) >= 20 && (
              <div className="flex items-start p-4 bg-red-50 rounded-lg">
                <i className="fas fa-exclamation-triangle text-red-500 text-xl mr-3 mt-1"></i>
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">High Usage Increase</h3>
                  <p className="text-red-700 text-sm">
                    Your {selectedUtility} usage has increased by {stats.usageChange}% compared to last month. 
                    Consider reviewing your consumption habits to reduce costs.
                  </p>
                </div>
              </div>
            )}

            {parseFloat(stats.usageChange) < 0 && (
              <div className="flex items-start p-4 bg-green-50 rounded-lg">
                <i className="fas fa-check-circle text-green-500 text-xl mr-3 mt-1"></i>
                <div>
                  <h3 className="font-semibold text-green-900 mb-1">Great Job!</h3>
                  <p className="text-green-700 text-sm">
                    Your {selectedUtility} usage has decreased by {Math.abs(stats.usageChange)}% compared to last month. 
                    Keep up the good work!
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start p-4 bg-blue-50 rounded-lg">
              <i className="fas fa-lightbulb text-blue-500 text-xl mr-3 mt-1"></i>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Tip</h3>
                <p className="text-blue-700 text-sm">
                  Monitor your usage regularly to identify patterns and opportunities for savings. 
                  Small changes in daily habits can lead to significant cost reductions over time.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsageTrends;
