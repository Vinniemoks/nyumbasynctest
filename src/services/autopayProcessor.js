import apiService from '../api/api';
import notificationService from './notificationService';

class AutopayProcessor {
  constructor() {
    this.processingQueue = [];
    this.isProcessing = false;
  }

  // Process scheduled autopay
  async processAutopay(autopayData) {
    console.log('Processing autopay...', autopayData);
    
    try {
      // Simulate payment processing
      const paymentData = {
        amount: autopayData.amount,
        dueDate: autopayData.nextPaymentDate,
        propertyId: autopayData.propertyId,
        paymentMethod: autopayData.paymentMethod,
        phoneNumber: autopayData.phoneNumber,
        isAutopay: true
      };

      // Call payment API
      const response = await apiService.post('/tenant/rent/pay', paymentData);
      
      if (response.success || response.status === 'completed') {
        // Payment successful - send confirmation within 10 seconds
        const successData = {
          amount: autopayData.amount,
          transactionReference: response.transactionReference || `TXN-${Date.now()}`,
          processedAt: new Date().toISOString(),
          paymentMethod: autopayData.paymentMethod
        };
        
        // Send notification within 10 seconds (simulated immediately)
        setTimeout(async () => {
          await notificationService.sendAutopaySuccess(successData);
        }, 2000); // 2 seconds to simulate processing
        
        return {
          success: true,
          payment: successData,
          message: 'Autopay processed successfully'
        };
      } else {
        throw new Error('Payment processing failed');
      }
    } catch (error) {
      console.error('Autopay processing failed:', error);
      
      // Payment failed - send alert within 1 minute
      const failureData = {
        amount: autopayData.amount,
        reason: error.message || 'Payment processing failed',
        failedAt: new Date().toISOString(),
        paymentMethod: autopayData.paymentMethod
      };
      
      // Send notification within 1 minute (simulated immediately)
      setTimeout(async () => {
        await notificationService.sendAutopayFailure(failureData);
      }, 5000); // 5 seconds to simulate delay
      
      return {
        success: false,
        error: failureData,
        message: 'Autopay processing failed'
      };
    }
  }

  // Check and process due autopay payments
  async checkAndProcessDuePayments() {
    try {
      // Get current autopay settings
      const autopaySettings = await apiService.get('/tenant/rent/autopay');
      
      if (!autopaySettings || !autopaySettings.enabled) {
        return { message: 'No active autopay settings' };
      }

      const today = new Date();
      const nextPaymentDate = new Date(autopaySettings.nextPaymentDate);
      
      // Check if payment is due today
      if (
        today.getDate() === nextPaymentDate.getDate() &&
        today.getMonth() === nextPaymentDate.getMonth() &&
        today.getFullYear() === nextPaymentDate.getFullYear()
      ) {
        console.log('Autopay payment is due today. Processing...');
        return await this.processAutopay(autopaySettings);
      }
      
      // Check if we need to send confirmation (3 days before)
      const daysUntilPayment = Math.ceil((nextPaymentDate - today) / (1000 * 60 * 60 * 24));
      if (daysUntilPayment === 3) {
        console.log('Sending autopay confirmation (3 days before)...');
        await notificationService.sendAutopayConfirmation({
          amount: autopaySettings.amount,
          nextPaymentDate: autopaySettings.nextPaymentDate,
          paymentMethod: autopaySettings.paymentMethod
        });
      }
      
      return { message: 'No payments due today' };
    } catch (error) {
      console.error('Error checking due payments:', error);
      return { error: error.message };
    }
  }

  // Simulate autopay for demo purposes
  async simulateAutopayProcessing(autopayData) {
    console.log('Simulating autopay processing...');
    
    // Step 1: Send confirmation notification (3 days before)
    await notificationService.sendAutopayConfirmation({
      amount: autopayData.amount,
      nextPaymentDate: autopayData.nextPaymentDate,
      paymentMethod: autopayData.paymentMethod
    });
    
    // Step 2: Wait and process payment
    return new Promise((resolve) => {
      setTimeout(async () => {
        const result = await this.processAutopay(autopayData);
        resolve(result);
      }, 3000); // Simulate 3-day wait with 3 seconds
    });
  }

  // Start autopay monitoring (would run as background service in production)
  startMonitoring(intervalMinutes = 60) {
    console.log(`Starting autopay monitoring (checking every ${intervalMinutes} minutes)...`);
    
    // Check immediately
    this.checkAndProcessDuePayments();
    
    // Then check periodically
    this.monitoringInterval = setInterval(() => {
      this.checkAndProcessDuePayments();
    }, intervalMinutes * 60 * 1000);
  }

  // Stop autopay monitoring
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('Autopay monitoring stopped');
    }
  }
}

export default new AutopayProcessor();
