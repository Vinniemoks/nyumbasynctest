import { useState, useEffect } from 'react';
import { Download, Calendar, CreditCard, CheckCircle, Search, Filter } from 'lucide-react';
import apiService from '../../../api/api';
import ReceiptViewer from './ReceiptViewer';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('all');

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/tenant/rent/history');
      setPayments(response);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      // Use mock data as fallback
      setPayments(generateMockPayments());
    } finally {
      setLoading(false);
    }
  };

  const generateMockPayments = () => {
    const mockPayments = [];
    const today = new Date();
    const paymentMethods = ['mpesa', 'airtel', 'card', 'telkom'];
    
    // Generate 12 months of payment history
    for (let i = 0; i < 12; i++) {
      const paymentDate = new Date(today.getFullYear(), today.getMonth() - i, 5);
      mockPayments.push({
        id: i + 1,
        amount: 50000,
        paymentDate: paymentDate.toISOString(),
        dueDate: new Date(today.getFullYear(), today.getMonth() - i, 5).toISOString(),
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        transactionReference: `TXN-${Date.now() - i * 1000000}`,
        status: 'completed',
        receiptUrl: `/receipts/${i + 1}.pdf`,
      });
    }
    
    return mockPayments;
  };

  const getPaymentMethodDisplay = (method) => {
    const methods = {
      mpesa: { icon: '📱', name: 'M-Pesa' },
      airtel: { icon: '📱', name: 'Airtel Money' },
      telkom: { icon: '📱', name: 'Telkom Money' },
      card: { icon: '💳', name: 'Credit/Debit Card' },
    };
    return methods[method] || { icon: '💰', name: 'Other' };
  };

  const calculateYearToDateTotal = () => {
    const currentYear = new Date().getFullYear();
    return payments
      .filter(payment => {
        const paymentYear = new Date(payment.paymentDate).getFullYear();
        return paymentYear === currentYear && payment.status === 'completed';
      })
      .reduce((total, payment) => total + payment.amount, 0);
  };

  const getAvailableYears = () => {
    const years = [...new Set(payments.map(p => new Date(p.paymentDate).getFullYear()))];
    return years.sort((a, b) => b - a);
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.transactionReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getPaymentMethodDisplay(payment.paymentMethod).name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesYear = 
      filterYear === 'all' || 
      new Date(payment.paymentDate).getFullYear().toString() === filterYear;
    
    return matchesSearch && matchesYear;
  });

  const handleViewReceipt = (payment) => {
    setSelectedPayment(payment);
    setShowReceipt(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showReceipt && selectedPayment) {
    return (
      <ReceiptViewer
        payment={selectedPayment}
        onClose={() => {
          setShowReceipt(false);
          setSelectedPayment(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-md p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm mb-1">Year-to-Date Total</p>
            <p className="text-4xl font-bold">
              KES {calculateYearToDateTotal().toLocaleString()}
            </p>
            <p className="text-green-100 text-sm mt-2">
              {payments.filter(p => 
                new Date(p.paymentDate).getFullYear() === new Date().getFullYear() &&
                p.status === 'completed'
              ).length} payments made this year
            </p>
          </div>
          <div className="p-4 bg-white bg-opacity-20 rounded-lg">
            <CheckCircle className="w-12 h-12" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by transaction reference or payment method..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Years</option>
              {getAvailableYears().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Payment History List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
          <p className="text-sm text-gray-600 mt-1">
            {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No payments found</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchTerm || filterYear !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Your payment history will appear here'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPayments.map((payment) => {
              const methodInfo = getPaymentMethodDisplay(payment.paymentMethod);
              return (
                <div
                  key={payment.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <CreditCard className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">
                            Rent Payment
                          </h4>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Paid
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(payment.paymentDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>{methodInfo.icon}</span>
                            <span>{methodInfo.name}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Ref: {payment.transactionReference}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          KES {payment.amount.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleViewReceipt(payment)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <Download className="w-4 h-4" />
                        Receipt
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
