import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../../../context/TenantContext';
import { useToast } from '../../../components/Toast';
import apiService from '../../../api/api';
import socketService from '../../../services/socketService';
import StatusBadge from '../../../components/shared/StatusBadge';
import ProgressTracker from '../../../components/shared/ProgressTracker';

const DepositRefund = () => {
  const navigate = useNavigate();
  const { property, lease } = useTenant();
  const { success, error: showError } = useToast();
  
  const [moveOutRequest, setMoveOutRequest] = useState(null);
  const [refundRequest, setRefundRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetchData();
    
    // Set up WebSocket listener for refund status updates (Requirement 5.4)
    const handleRefundStatusUpdate = (data) => {
      console.log('Refund status update received:', data);
      
      // Show notification for status change
      if (data.status) {
        const statusMessages = {
          submitted: 'Your deposit refund request has been submitted',
          inspection: 'Property inspection has been scheduled',
          approved: 'Your deposit refund has been approved',
          paid: 'Your deposit refund has been processed'
        };
        
        const message = statusMessages[data.status] || 'Refund status updated';
        success(message);
      }
      
      // Refresh data to show updated status
      fetchData();
    };
    
    socketService.on('refund_status_update', handleRefundStatusUpdate);
    
    // Cleanup listener on unmount
    return () => {
      socketService.off('refund_status_update', handleRefundStatusUpdate);
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch move-out request status
      const moveOutData = await apiService.getCurrentMoveOutRequest();
      setMoveOutRequest(moveOutData);
      
      // Fetch existing refund request if any
      const refundData = await apiService.getCurrentDepositRefund();
      setRefundRequest(refundData);
      
    } catch (err) {
      console.error('Failed to fetch data:', err);
      showError('Failed to load deposit refund information');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRefund = async () => {
    try {
      setSubmitting(true);
      
      const refundData = {
        moveOutRequestId: moveOutRequest.id,
        depositAmount: lease?.securityDeposit || 50000,
        propertyId: property?.id,
        leaseId: lease?.id
      };
      
      const response = await apiService.requestDepositRefund(refundData);
      
      success('Deposit refund request submitted successfully');
      setShowConfirmModal(false);
      
      // Refresh data
      await fetchData();
      
    } catch (err) {
      console.error('Failed to submit refund request:', err);
      showError('Failed to submit deposit refund request');
    } finally {
      setSubmitting(false);
    }
  };

  const getRefundProgressSteps = () => {
    if (!refundRequest) return { steps: [], currentStep: 0 };
    
    const stages = refundRequest.stages || [];
    const currentStage = stages.findIndex(s => !s.completed);
    const currentStep = currentStage === -1 ? stages.length - 1 : currentStage;
    
    const steps = [
      {
        label: 'Submitted',
        timestamp: stages[0]?.timestamp,
        description: 'Your deposit refund request has been submitted and is being reviewed.'
      },
      {
        label: 'Inspection',
        timestamp: stages[1]?.timestamp,
        description: 'Property inspection is being conducted to assess any damages or deductions.'
      },
      {
        label: 'Approved',
        timestamp: stages[2]?.timestamp,
        description: 'Your refund has been approved and is being processed for payment.'
      },
      {
        label: 'Paid',
        timestamp: stages[3]?.timestamp,
        description: 'Your deposit refund has been successfully processed and paid.'
      }
    ];
    
    return { steps, currentStep };
  };

  const getProcessingTimeline = () => {
    // Typical processing timeline: 14-30 days
    return '14-30 business days';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">Loading deposit refund information...</p>
        </div>
      </div>
    );
  }

  // Check if move-out request is approved (Requirement 5.1)
  if (!moveOutRequest || moveOutRequest.status !== 'completed') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
              <i className="fas fa-exclamation-triangle text-yellow-600 text-2xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Move-Out Not Completed
            </h2>
            <p className="text-gray-600 mb-6">
              You can only request a deposit refund after your move-out request has been completed and the property inspection is finished.
            </p>
          </div>

          {moveOutRequest && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <i className="fas fa-info-circle text-blue-600 mt-1 mr-3"></i>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Current Move-Out Status</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <StatusBadge status={moveOutRequest.status} size="sm" />
                  </div>
                  <p className="text-sm text-gray-700">
                    {moveOutRequest.status === 'pending' && 'Your move-out request is pending approval.'}
                    {moveOutRequest.status === 'approved' && 'Your move-out request has been approved. Waiting for inspection to be scheduled.'}
                    {moveOutRequest.status === 'inspection_scheduled' && 'Property inspection has been scheduled. Please complete the inspection first.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {moveOutRequest ? (
              <button
                onClick={() => navigate('/tenant-dashboard/move-out/status')}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                View Move-Out Status
              </button>
            ) : (
              <button
                onClick={() => navigate('/tenant-dashboard/move-out')}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Submit Move-Out Request
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
      </div>
    );
  }

  // If refund request already exists, show status
  if (refundRequest) {
    const { steps, currentStep } = getRefundProgressSteps();
    const isPaid = refundRequest.status === 'paid';
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Deposit Refund Status
              </h1>
              <StatusBadge status={refundRequest.status} size="lg" />
            </div>
            <p className="text-gray-600">
              Track the progress of your security deposit refund
            </p>
          </div>

          {/* Refund Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Deposit Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                KES {refundRequest.depositAmount?.toLocaleString() || '0'}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Processing Timeline</p>
              <p className="text-lg font-semibold text-gray-900">{getProcessingTimeline()}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Submitted On</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(refundRequest.submittedAt).toLocaleDateString('en-US', {
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
          </div>

          {/* Progress Tracker (Requirement 5.3) */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Refund Progress</h3>
            <ProgressTracker steps={steps} currentStep={currentStep} />
          </div>

          {/* Deductions (if any) */}
          {refundRequest.deductions && refundRequest.deductions.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Deductions</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="space-y-3">
                  {refundRequest.deductions.map((deduction, index) => (
                    <div key={index} className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{deduction.reason}</p>
                        {deduction.description && (
                          <p className="text-sm text-gray-600">{deduction.description}</p>
                        )}
                      </div>
                      <p className="font-semibold text-red-600">
                        -KES {deduction.amount.toLocaleString()}
                      </p>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-yellow-300 flex justify-between items-center">
                    <p className="font-semibold text-gray-900">Total Deductions</p>
                    <p className="font-bold text-red-600">
                      -KES {refundRequest.deductions.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="pt-2 flex justify-between items-center">
                    <p className="font-semibold text-gray-900">Refund Amount</p>
                    <p className="font-bold text-green-600 text-xl">
                      KES {(refundRequest.depositAmount - refundRequest.deductions.reduce((sum, d) => sum + d.amount, 0)).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Completion Details (Requirement 5.5) */}
          {isPaid && refundRequest.paymentDetails && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-start mb-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <i className="fas fa-check-circle text-green-600 text-2xl"></i>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Refund Completed</h4>
                    <p className="text-sm text-gray-700">
                      Your security deposit refund has been successfully processed.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Payment Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(refundRequest.paymentDetails.paymentDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
                    <p className="font-semibold text-green-600 text-lg">
                      KES {refundRequest.paymentDetails.amount?.toLocaleString() || '0'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Transaction Reference</p>
                    <p className="font-semibold text-gray-900 font-mono text-sm">
                      {refundRequest.paymentDetails.transactionReference}
                    </p>
                  </div>
                </div>

                {refundRequest.paymentDetails.paymentMethod && (
                  <div className="mt-4 pt-4 border-t border-green-300">
                    <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                    <p className="font-semibold text-gray-900">
                      {refundRequest.paymentDetails.paymentMethod}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status Change Notifications (Requirement 5.4) */}
          {refundRequest.statusHistory && refundRequest.statusHistory.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status History</h3>
              <div className="space-y-3">
                {refundRequest.statusHistory.map((history, index) => (
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
            <button
              onClick={() => navigate('/tenant-dashboard')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show refund request form (Requirement 5.2)
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <i className="fas fa-money-bill-wave text-green-600 text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Request Deposit Refund
          </h2>
          <p className="text-gray-600">
            Your move-out has been completed. You can now request your security deposit refund.
          </p>
        </div>

        {/* Deposit Information */}
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Security Deposit Amount</p>
                <p className="text-3xl font-bold text-gray-900">
                  KES {lease?.securityDeposit?.toLocaleString() || '50,000'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Processing Timeline</p>
                <p className="text-lg font-semibold text-gray-900">{getProcessingTimeline()}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-blue-300">
              <p className="text-sm text-gray-700">
                <i className="fas fa-info-circle text-blue-600 mr-2"></i>
                The refund amount may be adjusted based on property inspection findings. Any damages or outstanding bills will be deducted from the deposit.
              </p>
            </div>
          </div>
        </div>

        {/* Property Details */}
        {property && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Property Details</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-semibold text-gray-900">{property.address}</p>
              {property.unitNumber && (
                <p className="text-sm text-gray-600">Unit: {property.unitNumber}</p>
              )}
            </div>
          </div>
        )}

        {/* Move-Out Details */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Move-Out Details</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Reference Number:</span>
              <span className="text-sm font-semibold text-gray-900">{moveOutRequest.referenceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Move-Out Date:</span>
              <span className="text-sm font-semibold text-gray-900">
                {new Date(moveOutRequest.moveOutDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              <StatusBadge status={moveOutRequest.status} size="sm" />
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
            <i className="fas fa-exclamation-circle text-yellow-600 mr-2"></i>
            Important Information
          </h3>
          <ul className="text-sm text-gray-700 space-y-1 ml-6 list-disc">
            <li>Refund processing typically takes {getProcessingTimeline()}</li>
            <li>The final amount may differ based on inspection findings</li>
            <li>You will be notified of any deductions before payment</li>
            <li>Refund will be sent to your registered payment method</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowConfirmModal(true)}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            <i className="fas fa-paper-plane mr-2"></i>
            Submit Refund Request
          </button>
          <button
            onClick={() => navigate('/tenant-dashboard')}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto mb-4">
              <i className="fas fa-check-circle text-green-600 text-xl"></i>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Confirm Refund Request
            </h3>
            
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to submit your deposit refund request for KES {lease?.securityDeposit?.toLocaleString() || '50,000'}?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRefund}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Submitting...
                  </>
                ) : (
                  'Yes, Submit'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositRefund;
