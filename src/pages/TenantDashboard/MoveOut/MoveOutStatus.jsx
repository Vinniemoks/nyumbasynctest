import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../../../context/TenantContext';
import { useToast } from '../../../components/Toast';
import apiService from '../../../api/api';
import StatusBadge from '../../../components/shared/StatusBadge';
import ProgressTracker from '../../../components/shared/ProgressTracker';

const MoveOutStatus = () => {
  const navigate = useNavigate();
  const { property } = useTenant();
  const { success, error: showError } = useToast();
  
  const [moveOutRequest, setMoveOutRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    fetchMoveOutStatus();
  }, []);

  const fetchMoveOutStatus = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCurrentMoveOutRequest();
      setMoveOutRequest(data);
    } catch (err) {
      console.error('Failed to fetch move-out status:', err);
      showError('Failed to load move-out status');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    try {
      await apiService.cancelMoveOutRequest(moveOutRequest.id);
      success('Move-out request cancelled successfully');
      setShowCancelModal(false);
      fetchMoveOutStatus();
    } catch (err) {
      console.error('Failed to cancel move-out request:', err);
      showError('Failed to cancel move-out request');
    }
  };

  const getProgressSteps = () => {
    const statusMap = {
      'pending': 0,
      'approved': 1,
      'inspection_scheduled': 2,
      'completed': 3,
      'cancelled': 0,
      'rejected': 0
    };

    const steps = [
      {
        label: 'Submitted',
        timestamp: moveOutRequest?.submittedAt,
        description: 'Your move-out request has been submitted and is awaiting review by your property stakeholder.'
      },
      {
        label: 'Approved',
        timestamp: moveOutRequest?.approvedAt,
        description: 'Your move-out request has been approved. An inspection will be scheduled soon.'
      },
      {
        label: 'Inspection Scheduled',
        timestamp: moveOutRequest?.inspectionScheduledAt,
        note: moveOutRequest?.inspectionDate ? `Scheduled for ${new Date(moveOutRequest.inspectionDate).toLocaleDateString()}` : null,
        description: 'A property inspection has been scheduled. Please ensure the property is ready for inspection.'
      },
      {
        label: 'Completed',
        timestamp: moveOutRequest?.completedAt,
        description: 'Move-out process completed. You can now request your deposit refund.'
      }
    ];

    const currentStep = statusMap[moveOutRequest?.status] || 0;
    
    return { steps, currentStep };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">Loading move-out status...</p>
        </div>
      </div>
    );
  }

  if (!moveOutRequest) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
            <i className="fas fa-inbox text-gray-400 text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Move-Out Request
          </h2>
          <p className="text-gray-600 mb-6">
            You haven't submitted a move-out request yet.
          </p>
          <button
            onClick={() => navigate('/tenant-dashboard/move-out')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Submit Move-Out Request
          </button>
        </div>
      </div>
    );
  }

  const { steps, currentStep } = getProgressSteps();
  const canCancel = moveOutRequest.status === 'pending';
  const canRequestRefund = moveOutRequest.status === 'completed';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Move-Out Status
            </h1>
            <StatusBadge status={moveOutRequest.status} size="lg" />
          </div>
          <p className="text-gray-600">
            Track the progress of your move-out request
          </p>
        </div>

        {/* Request Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Reference Number</p>
            <p className="text-lg font-semibold text-gray-900">{moveOutRequest.referenceNumber}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Move-Out Date</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(moveOutRequest.moveOutDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {property && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Property</p>
              <p className="text-lg font-semibold text-gray-900">{property.address}</p>
              {property.unitNumber && (
                <p className="text-sm text-gray-600">Unit: {property.unitNumber}</p>
              )}
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Submitted On</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(moveOutRequest.submittedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Reason */}
        {moveOutRequest.reason && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Reason for Moving Out</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">{moveOutRequest.reason}</p>
            </div>
          </div>
        )}

        {/* Progress Tracker */}
        {moveOutRequest.status !== 'cancelled' && moveOutRequest.status !== 'rejected' && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Progress</h3>
            <ProgressTracker steps={steps} currentStep={currentStep} />
          </div>
        )}

        {/* Cancelled/Rejected Message */}
        {(moveOutRequest.status === 'cancelled' || moveOutRequest.status === 'rejected') && (
          <div className={`mb-8 p-4 rounded-lg ${
            moveOutRequest.status === 'cancelled' ? 'bg-gray-50 border border-gray-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start">
              <i className={`fas ${
                moveOutRequest.status === 'cancelled' ? 'fa-ban text-gray-600' : 'fa-times-circle text-red-600'
              } mt-1 mr-3`}></i>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {moveOutRequest.status === 'cancelled' ? 'Request Cancelled' : 'Request Rejected'}
                </h3>
                <p className="text-sm text-gray-700">
                  {moveOutRequest.status === 'cancelled' 
                    ? 'This move-out request has been cancelled.'
                    : 'Your move-out request has been rejected by the property stakeholder.'}
                </p>
                {moveOutRequest.rejectionReason && (
                  <p className="text-sm text-gray-700 mt-2">
                    <strong>Reason:</strong> {moveOutRequest.rejectionReason}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Inspection Details */}
        {moveOutRequest.status === 'inspection_scheduled' && moveOutRequest.inspectionDate && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <i className="fas fa-calendar-check text-blue-600 mt-1 mr-3"></i>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Inspection Scheduled</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Your property inspection is scheduled for:
                </p>
                <p className="text-lg font-semibold text-blue-600">
                  {new Date(moveOutRequest.inspectionDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  {moveOutRequest.inspectionTime && ` at ${moveOutRequest.inspectionTime}`}
                </p>
                {moveOutRequest.inspectionNotes && (
                  <p className="text-sm text-gray-700 mt-2">
                    <strong>Notes:</strong> {moveOutRequest.inspectionNotes}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Status History */}
        {moveOutRequest.statusHistory && moveOutRequest.statusHistory.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status History</h3>
            <div className="space-y-3">
              {moveOutRequest.statusHistory.map((history, index) => (
                <div key={index} className="flex items-start bg-gray-50 rounded-lg p-4">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <StatusBadge status={history.status} size="sm" />
                      <span className="text-xs text-gray-500">
                        {new Date(history.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {history.note && (
                      <p className="text-sm text-gray-700 mt-1">{history.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          {canRequestRefund && (
            <button
              onClick={() => navigate('/tenant-dashboard/move-out/deposit')}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              <i className="fas fa-money-bill-wave mr-2"></i>
              Request Deposit Refund
            </button>
          )}
          
          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
            >
              <i className="fas fa-times mr-2"></i>
              Cancel Request
            </button>
          )}
          
          <button
            onClick={() => navigate('/tenant-dashboard')}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Cancel Move-Out Request?
            </h3>
            
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to cancel this move-out request? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Keep Request
              </button>
              <button
                onClick={handleCancelRequest}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoveOutStatus;
