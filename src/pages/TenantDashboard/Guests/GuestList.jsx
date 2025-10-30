import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../../api/api';

const GuestList = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, arrived, expired
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [grantingAccess, setGrantingAccess] = useState(false);

  useEffect(() => {
    fetchGuests();
    
    // Listen for guest arrival notifications
    const handleGuestArrival = (event) => {
      const { guestId } = event.detail;
      setGuests(prev =>
        prev.map(guest =>
          guest.id === guestId
            ? { ...guest, status: 'arrived', arrivedAt: new Date().toISOString() }
            : guest
        )
      );
    };
    
    window.addEventListener('guestArrival', handleGuestArrival);
    
    return () => {
      window.removeEventListener('guestArrival', handleGuestArrival);
    };
  }, []);

  const fetchGuests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getGuests();
      setGuests(data);
    } catch (err) {
      setError(err.message || 'Failed to load guests');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelGuest = async (guestId) => {
    if (!window.confirm('Are you sure you want to cancel this guest registration?')) {
      return;
    }

    try {
      await apiService.cancelGuestRegistration(guestId);
      setGuests(prev => prev.filter(g => g.id !== guestId));
    } catch (err) {
      alert('Failed to cancel guest registration: ' + err.message);
    }
  };

  const handleGrantAccess = async () => {
    if (!selectedGuest) return;

    try {
      setGrantingAccess(true);
      const result = await apiService.grantRemoteAccess(selectedGuest.id);
      alert(result.message);
      setShowAccessModal(false);
      setSelectedGuest(null);
    } catch (err) {
      alert('Failed to grant access: ' + err.message);
    } finally {
      setGrantingAccess(false);
    }
  };

  const filteredGuests = guests.filter(guest => {
    if (filter === 'all') return true;
    return guest.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'arrived':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return 'fas fa-clock';
      case 'arrived':
        return 'fas fa-check-circle';
      case 'expired':
        return 'fas fa-times-circle';
      default:
        return 'fas fa-question-circle';
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffTime < 0) {
      // Past date
      const absDiffHours = Math.abs(diffHours);
      if (absDiffHours < 24) {
        return `${absDiffHours} hour${absDiffHours !== 1 ? 's' : ''} ago`;
      }
      const absDiffDays = Math.abs(diffDays);
      return `${absDiffDays} day${absDiffDays !== 1 ? 's' : ''} ago`;
    } else {
      // Future date
      if (diffHours < 24) {
        return `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
      }
      return `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    }
  };

  const formatFullDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">Loading guests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <i className="fas fa-exclamation-circle text-red-600 text-4xl mb-4"></i>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Guests</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchGuests}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <i className="fas fa-redo mr-2"></i>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <i className="fas fa-user-friends text-blue-600 mr-3"></i>
              Guest Management
            </h1>
            <p className="text-gray-600 mt-2">Register and manage your visitors</p>
          </div>
          <Link
            to="/tenant-dashboard/guests/register"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <i className="fas fa-plus mr-2"></i>
            Register Guest
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 border-b border-gray-200">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            All ({guests.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === 'pending'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Pending ({guests.filter(g => g.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('arrived')}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === 'arrived'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Arrived ({guests.filter(g => g.status === 'arrived').length})
          </button>
          <button
            onClick={() => setFilter('expired')}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === 'expired'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Expired ({guests.filter(g => g.status === 'expired').length})
          </button>
        </div>
      </div>

      {/* Guest List */}
      {filteredGuests.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <i className="fas fa-user-friends text-gray-400 text-5xl mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Guests Found</h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all'
              ? 'You have not registered any guests yet.'
              : `No ${filter} guests at this time.`}
          </p>
          <Link
            to="/tenant-dashboard/guests/register"
            className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-plus mr-2"></i>
            Register Your First Guest
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredGuests.map((guest) => (
            <div
              key={guest.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                {/* Guest Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center">
                      <i className="fas fa-user text-xl"></i>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{guest.guestName}</h3>
                      <p className="text-sm text-gray-600">
                        <i className="fas fa-phone mr-1"></i>
                        {guest.guestPhone}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(guest.status)}`}>
                      <i className={`${getStatusIcon(guest.status)} mr-1`}></i>
                      {guest.status.charAt(0).toUpperCase() + guest.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-15">
                    {/* Expected Arrival */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Expected Arrival</p>
                      <p className="text-sm font-medium text-gray-800">
                        {formatFullDateTime(guest.expectedArrival)}
                      </p>
                      <p className="text-xs text-gray-600">{formatDateTime(guest.expectedArrival)}</p>
                    </div>

                    {/* Access Code */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Access Code</p>
                      <p className="text-2xl font-bold text-blue-600 tracking-wider">{guest.accessCode}</p>
                      <p className="text-xs text-gray-600">
                        {guest.status === 'expired' ? 'Expired' : `Valid for 24 hours`}
                      </p>
                    </div>

                    {/* Arrival Status */}
                    {guest.arrivedAt && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Arrived At</p>
                        <p className="text-sm font-medium text-gray-800">
                          {formatFullDateTime(guest.arrivedAt)}
                        </p>
                        <p className="text-xs text-gray-600">{formatDateTime(guest.arrivedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 ml-4">
                  {guest.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedGuest(guest);
                          setShowAccessModal(true);
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center whitespace-nowrap"
                      >
                        <i className="fas fa-door-open mr-2"></i>
                        Grant Access
                      </button>
                      <button
                        onClick={() => handleCancelGuest(guest.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center whitespace-nowrap"
                      >
                        <i className="fas fa-times mr-2"></i>
                        Cancel
                      </button>
                    </>
                  )}
                  {guest.status === 'arrived' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-center">
                      <i className="fas fa-check-circle text-green-600 text-xl mb-1"></i>
                      <p className="text-xs text-green-700 font-medium">Guest Arrived</p>
                    </div>
                  )}
                  {guest.status === 'expired' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-center">
                      <i className="fas fa-times-circle text-red-600 text-xl mb-1"></i>
                      <p className="text-xs text-red-700 font-medium">Code Expired</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Remote Access Modal */}
      {showAccessModal && selectedGuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-door-open text-green-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Grant Remote Access</h3>
              <p className="text-gray-600">
                Grant remote access to <span className="font-semibold">{selectedGuest.guestName}</span>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This will open the gate automatically for your guest.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowAccessModal(false);
                  setSelectedGuest(null);
                }}
                disabled={grantingAccess}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleGrantAccess}
                disabled={grantingAccess}
                className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center"
              >
                {grantingAccess ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Granting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check mr-2"></i>
                    Grant Access
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="fas fa-info-circle text-xl"></i>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Guest Access Information</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li><i className="fas fa-check text-green-600 mr-2"></i>Access codes are valid for 24 hours</li>
              <li><i className="fas fa-check text-green-600 mr-2"></i>Guests receive codes via SMS within 1 minute</li>
              <li><i className="fas fa-check text-green-600 mr-2"></i>You'll be notified when your guest arrives</li>
              <li><i className="fas fa-check text-green-600 mr-2"></i>Grant remote access to open the gate for your guests</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestList;
