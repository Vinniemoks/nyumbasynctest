import { Download, CheckCircle, Printer } from 'lucide-react';
import { useRef } from 'react';

const ReceiptViewer = ({ payment, onClose }) => {
  const receiptRef = useRef();

  if (!payment) {
    return null;
  }

  const handleDownload = () => {
    // In production, this would generate a PDF using react-pdf or similar
    // For now, we'll trigger a print dialog
    window.print();
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentMethodName = (method) => {
    const methods = {
      mpesa: 'M-Pesa',
      airtel: 'Airtel Money',
      telkom: 'Telkom Money',
      card: 'Credit/Debit Card',
    };
    return methods[method] || method;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
          {/* Header Actions */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center print:hidden">
            <h2 className="text-lg font-semibold text-gray-900">Payment Receipt</h2>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </button>
              <button
                onClick={onClose}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>

          {/* Receipt Content */}
          <div ref={receiptRef} className="p-8 bg-white">
            {/* Success Badge */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="font-semibold">Payment Successful</span>
              </div>
            </div>

            {/* Company Header */}
            <div className="text-center mb-8 border-b border-gray-200 pb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">NyumbaSync</h1>
              <p className="text-sm text-gray-600">Property Management System</p>
              <p className="text-sm text-gray-600">Email: info@nyumbasync.com | Phone: +254 700 000 000</p>
            </div>

            {/* Receipt Details */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Receipt Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Receipt Number</p>
                  <p className="font-semibold text-gray-900">{payment.transactionId || payment.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Date</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(payment.paymentDate || payment.date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Time</p>
                  <p className="font-semibold text-gray-900">
                    {formatTime(payment.paymentDate || payment.date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-semibold text-gray-900">
                    {getPaymentMethodName(payment.paymentMethod || payment.method)}
                  </p>
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Property Address</p>
                <p className="font-semibold text-gray-900">{payment.propertyAddress || 'Property Address'}</p>
                {payment.unitNumber && (
                  <>
                    <p className="text-sm text-gray-600 mt-2">Unit Number</p>
                    <p className="font-semibold text-gray-900">{payment.unitNumber}</p>
                  </>
                )}
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Breakdown</h2>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Monthly Rent
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        KES {payment.amount?.toLocaleString() || '0'}
                      </td>
                    </tr>
                    {payment.lateFee && payment.lateFee > 0 && (
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Late Fee
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          KES {payment.lateFee.toLocaleString()}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        Total Amount Paid
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                        KES {((payment.amount || 0) + (payment.lateFee || 0)).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Transaction Reference */}
            {payment.transactionReference && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Reference</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-mono text-sm text-gray-900">{payment.transactionReference}</p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-gray-200 pt-6 mt-8">
              <p className="text-sm text-gray-600 text-center">
                This is a computer-generated receipt and does not require a signature.
              </p>
              <p className="text-sm text-gray-600 text-center mt-2">
                For any queries, please contact us at support@nyumbasync.com
              </p>
              <p className="text-xs text-gray-500 text-center mt-4">
                Generated on {formatDate(new Date().toISOString())} at {formatTime(new Date().toISOString())}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptViewer;
