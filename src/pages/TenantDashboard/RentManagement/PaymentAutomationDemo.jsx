import { useState } from 'react';
import { Play, CheckCircle, AlertCircle } from 'lucide-react';
import notificationService from '../../../services/notificationService';
import autopayProcessor from '../../../services/autopayProcessor';
import scheduledPaymentProcessor from '../../../services/scheduledPaymentProcessor';

const PaymentAutomationDemo = () => {
  const [demoResults, setDemoResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (message, type = 'info') => {
    setDemoResults(prev => [...prev, { message, type, timestamp: new Date().toISOString() }]);
  };

  const runAutopayDemo = async () => {
    setIsRunning(true);
    setDemoResults([]);
    
    addResult('Starting Autopay Demo...', 'info');
    
    const autopayData = {
      amount: 50000,
      nextPaymentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: 'mpesa',
      phoneNumber: '+254712345678',
      propertyId: '1'
    };
    
    try {
      // Step 1: Send confirmation notification (3 days before)
      addResult('Sending autopay confirmation notification (3 days before)...', 'info');
      await notificationService.sendAutopayConfirmation(autopayData);
      addResult('✓ Confirmation notification sent successfully', 'success');
      
      // Step 2: Simulate payment processing
      addResult('Simulating payment processing on scheduled date...', 'info');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = await autopayProcessor.processAutopay(autopayData);
      
      if (result.success) {
        addResult('✓ Autopay processed successfully', 'success');
        addResult(`Transaction Reference: ${result.payment.transactionReference}`, 'success');
      } else {
        addResult('✗ Autopay processing failed', 'error');
        addResult(`Reason: ${result.error.reason}`, 'error');
      }
    } catch (error) {
      addResult(`✗ Error: ${error.message}`, 'error');
    }
    
    setIsRunning(false);
  };

  const runScheduledPaymentDemo = async () => {
    setIsRunning(true);
    setDemoResults([]);
    
    addResult('Starting Scheduled Payment Demo...', 'info');
    
    const paymentData = {
      id: Date.now(),
      amount: 50000,
      scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: 'mpesa',
      phoneNumber: '+254712345678',
      propertyId: '1',
      status: 'scheduled'
    };
    
    try {
      // Step 1: Send reminder (24 hours before)
      addResult('Sending scheduled payment reminder (24 hours before)...', 'info');
      await notificationService.sendScheduledPaymentReminder(paymentData);
      addResult('✓ Reminder notification sent successfully', 'success');
      
      // Step 2: Simulate payment processing
      addResult('Simulating payment processing on scheduled date...', 'info');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = await scheduledPaymentProcessor.processScheduledPayment(paymentData);
      
      if (result.success) {
        addResult('✓ Scheduled payment processed successfully', 'success');
      } else {
        addResult('✗ Scheduled payment processing failed', 'error');
        addResult(`Reason: ${result.error}`, 'error');
      }
    } catch (error) {
      addResult(`✗ Error: ${error.message}`, 'error');
    }
    
    setIsRunning(false);
  };

  const runReminderDemo = async () => {
    setIsRunning(true);
    setDemoResults([]);
    
    addResult('Starting Reminder Demo...', 'info');
    
    try {
      // Simulate different reminder timings
      const timings = [7, 3, 1];
      
      for (const days of timings) {
        addResult(`Simulating ${days}-day reminder...`, 'info');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await notificationService.notify({
          type: 'rent_reminder',
          title: 'Rent Payment Reminder',
          message: `Your rent is due in ${days} day${days !== 1 ? 's' : ''}. Don't forget to make your payment.`,
          priority: days === 1 ? 'high' : 'medium',
          timestamp: new Date().toISOString()
        });
        
        addResult(`✓ ${days}-day reminder sent successfully`, 'success');
      }
    } catch (error) {
      addResult(`✗ Error: ${error.message}`, 'error');
    }
    
    setIsRunning(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Payment Automation Demo
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Test the payment automation features including autopay, scheduled payments, and reminders.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={runAutopayDemo}
            disabled={isRunning}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            Test Autopay
          </button>
          
          <button
            onClick={runScheduledPaymentDemo}
            disabled={isRunning}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            Test Scheduled Payment
          </button>
          
          <button
            onClick={runReminderDemo}
            disabled={isRunning}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            Test Reminders
          </button>
        </div>

        {demoResults.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Demo Results:</h4>
            <div className="space-y-2">
              {demoResults.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2 text-sm ${
                    result.type === 'success'
                      ? 'text-green-700'
                      : result.type === 'error'
                      ? 'text-red-700'
                      : 'text-gray-700'
                  }`}
                >
                  {result.type === 'success' && <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                  {result.type === 'error' && <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                  <span className="flex-1">{result.message}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isRunning && (
          <div className="flex items-center justify-center gap-2 text-blue-600 mt-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm font-medium">Running demo...</span>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Demo Information</h4>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Autopay demo simulates confirmation notification (3 days before) and payment processing</li>
          <li>Scheduled payment demo simulates reminder (24 hours before) and payment processing</li>
          <li>Reminder demo simulates notifications at 7, 3, and 1 day before rent is due</li>
          <li>Check the notification bell to see the notifications generated by these demos</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentAutomationDemo;
