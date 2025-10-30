import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../../api/api';
import StatusBadge from '../../../components/shared/StatusBadge';

const MaintenanceList = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchMaintenanceRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [statusFilter, requests]);

  const fetchMaintenanceRequests = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMaintenanceRequests();
      setRequests(data);
      setError(null);
    } catch (err) {
      setError('Failed to load maintenance requests. Please try again.');
      console.error('Error fetching maintenance requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    if (statusFilter === 'all') {
      setFilteredRequests(requests);
    } else if (statusFilter === 'active') {
      setFilteredRequests(requests.filter(req => 
        req.status !== 'completed' && req.status !== 'cancelled'
      ));
    } else if (statusFilter === 'completed') {
      setFilteredRequests(requests.filter(req => req.status === 'completed'));
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'plumbing':
        return 'fa-faucet';
      case 'electrical':
        return 'fa-bolt';
      case 'hvac':
        return 'fa-fan';
      case 'appliances':
        return 'fa-blender';
      default:
        return 'fa-tools';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">Loading maintenance requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Maintenance Requests</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Track and manage your maintenance requests</p>
          </div>
          <button
            onClick={() => navigate('/tenant-dashboard/maintenance/new')}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 touch-manipulation"
            style={{ minHeight: '44px' }}
          >
            <i className="fas fa-plus"></i>
            <span className="text-sm sm:text-base">New Request</span>
          </button>
        </div>

        {/* Filter Tabs - Scrollable on mobile */}
        <div className="flex gap-2 border-b border-gray-200 overflow-x-auto pb-px -mx-3 px-3 sm:mx-0 sm:px-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 sm:px-4 py-2 font-medium transition-colors whitespace-nowrap touch-manipulation ${
              statusFilter === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            style={{ minHeight: '44px' }}
          >
            <span className="text-sm sm:text-base">All ({requests.length})</span>
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 sm:px-4 py-2 font-medium transition-colors whitespace-nowrap touch-manipulation ${
              statusFilter === 'active'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            style={{ minHeight: '44px' }}
          >
            <span className="text-sm sm:text-base">Active ({requests.filter(r => r.status !== 'completed' && r.status !== 'cancelled').length})</span>
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 sm:px-4 py-2 font-medium transition-colors whitespace-nowrap touch-manipulation ${
              statusFilter === 'completed'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            style={{ minHeight: '44px' }}
          >
            <span className="text-sm sm:text-base">Completed ({requests.filter(r => r.status === 'completed').length})</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
          <button
            onClick={fetchMaintenanceRequests}
            className="ml-auto text-red-700 hover:text-red-900 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-12 text-center">
          <i className="fas fa-tools text-4xl sm:text-6xl text-gray-300 mb-3 sm:mb-4"></i>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            {statusFilter === 'all' ? 'No Maintenance Requests' : `No ${statusFilter} Requests`}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            {statusFilter === 'all' 
              ? 'You haven\'t submitted any maintenance requests yet.'
              : `You don't have any ${statusFilter} maintenance requests.`
            }
          </p>
          {statusFilter === 'all' && (
            <button
              onClick={() => navigate('/tenant-dashboard/maintenance/new')}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2 touch-manipulation"
              style={{ minHeight: '44px' }}
            >
              <i className="fas fa-plus"></i>
              <span className="text-sm sm:text-base">Create Your First Request</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              onClick={() => navigate(`/tenant-dashboard/maintenance/${request.id}`)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md active:shadow-lg transition-shadow cursor-pointer touch-manipulation"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                  {/* Category Icon */}
                  <div className="bg-blue-50 text-blue-600 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className={`fas ${getCategoryIcon(request.category)} text-lg sm:text-xl`}></i>
                  </div>

                  {/* Request Details */}
                  <div className="flex-1 min-w-0">
                    <div className="mb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">
                        {request.description}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <i className="fas fa-hashtag"></i>
                          <span className="truncate">{request.ticketNumber || `REQ-${request.id}`}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="fas fa-calendar"></i>
                          {request.date}
                        </span>
                        <span className="hidden sm:flex items-center gap-1">
                          <i className="fas fa-clock"></i>
                          {request.time}
                        </span>
                      </div>
                    </div>

                    {/* Category and Priority */}
                    <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-3">
                      <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm font-medium">
                        <i className={`fas ${getCategoryIcon(request.category)}`}></i>
                        <span className="hidden sm:inline">{request.category.charAt(0).toUpperCase() + request.category.slice(1)}</span>
                        <span className="sm:hidden">{request.category.charAt(0).toUpperCase() + request.category.slice(1).substring(0, 4)}</span>
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getPriorityColor(request.priority)}`}>
                        <i className="fas fa-flag"></i>
                        <span className="hidden sm:inline">{request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority</span>
                        <span className="sm:hidden">{request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex-shrink-0">
                  <StatusBadge status={request.status} />
                </div>
              </div>

              {/* Assigned Vendor (if any) */}
              {request.assignedVendor && (
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <i className="fas fa-user-tie"></i>
                    <span className="truncate">Assigned to: <span className="font-medium text-gray-900">{request.assignedVendor}</span></span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaintenanceList;
