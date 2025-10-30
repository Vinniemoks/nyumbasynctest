import apiService from '../api/api';
import notificationService from './notificationService';

class ScheduledPaymentProcessor {
  constructor() {
    this.processingQueue = [];
  }

  // Check and send reminders for scheduled payments
  async checkAndSendReminders() {
    try {
      const scheduledPayments = await apiService.getScheduledPayments();
      
      if (!scheduledPayments || scheduledPayments.length === 0) {
        return { message: 'No scheduled payments' };
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const payment of scheduledPayments) {
        const scheduledDate = new Date(payment.scheduledDate);
        scheduledDate.setHours(0, 0, 0, 0);
        
        const daysUntilPayment = Math.ceil((scheduledDate - today) / (1000 * 60 * 60 * 24));
        
        // Send reminder 24 hours (1 day) before
        if (daysUntilPayment === 1 && !payment.reminderSent) {
          console.log('Sending scheduled payment reminder (24 hours before)...');
          await notificationService.sendScheduledPaymentReminder({
            amount: payment.amount,
            scheduledDate: payment.scheduledDate,
            paymentMethod: payment.paymentMethod
          });
          
          // Mark reminder as sent
          await apiService.put(`/tenant/rent/scheduled-payments/${payment.id}`, {
            reminderSent: true
          });
        }
        
        // Process payment on scheduled date
        if (daysUntilPayment === 0 && payment.status === 'scheduled') {
          console.log('Processing scheduled payment...');
          await this.processScheduledPayment(payment);
        }
      }
      
      return { message: 'Reminders checked and sent' };
    } catch (error) {
      console.error('Error checking scheduled payment reminders:', error);
      return { error: error.message };
    }
  }

  // Process a scheduled payment
  async processScheduledPayment(payment) {
    try {
      console.log('Processing scheduled payment:', payment);
      
      const paymentData = {
        amount: payment.amount,
        dueDate: payment.scheduledDate,
        propertyId: payment.propertyId,
        paymentMethod: payment.paymentMethod,
        phoneNumber: payment.phoneNumber,
        isScheduled: true
      };

      // Call payment API
      const response = await apiService.post('/tenant/rent/pay', paymentData);
      
      if (response.success || response.status === 'completed') {
        // Payment successful
        await apiService.put(`/tenant/rent/scheduled-payments/${payment.id}`, {
          status: 'completed',
          processedAt: new Date().toISOString(),
          transactionReference: response.transactionReference || `TXN-${Date.now()}`
        });
        
        // Send success notification
        await notificationService.notify({
          type: 'payment_success',
          title: 'Scheduled Payment Successful',
          message: `Your scheduled rent payment of KES ${payment.amount.toLocaleString()} has been processed successfully.`,
          priority: 'high',
          timestamp: new Date().toISOString()
        });
        
        return {
          success: true,
          payment: response,
          message: 'Scheduled payment processed successfully'
        };
      } else {
        throw new Error('Payment processing failed');
      }
    } catch (error) {
      console.error('Scheduled payment processing failed:', error);
      
      // Mark payment as failed
      await apiService.put(`/tenant/rent/scheduled-payments/${payment.id}`, {
        status: 'failed',
        failedAt: new Date().toISOString(),
        failureReason: error.message
      });
      
      // Send failure notification
      await notificationService.notify({
        type: 'payment_failure',
        title: 'Scheduled Payment Failed',
        message: `Your scheduled rent payment of KES ${payment.amount.toLocaleString()} could not be processed. Please make a manual payment.`,
        priority: 'urgent',
        timestamp: new Date().toISOString(),
        actionUrl: '/tenant-dashboard/rent',
        actionText: 'Pay Now'
      });
      
      return {
        success: false,
        error: error.message,
        message: 'Scheduled payment processing failed'
      };
    }
  }

  // Simulate scheduled payment reminder (for demo purposes)
  async simulateScheduledPaymentReminder(paymentData) {
    console.log('Simulating scheduled payment reminder (24 hours before)...');
    
    // Send reminder notification
    await notificationService.sendScheduledPaymentReminder({
      amount: paymentData.amount,
      scheduledDate: paymentData.scheduledDate,
      paymentMethod: paymentData.paymentMethod
    });
    
    // Wait and process payment
    return new Promise((resolve) => {
      setTimeout(async () => {
        const result = await this.processScheduledPayment(paymentData);
        resolve(result);
      }, 3000); // Simulate 24-hour wait with 3 seconds
    });
  }

  // Start monitoring scheduled payments (would run as background service in production)
  startMonitoring(intervalMinutes = 60) {
    console.log(`Starting scheduled payment monitoring (checking every ${intervalMinutes} minutes)...`);
    
    // Check immediately
    this.checkAndSendReminders();
    
    // Then check periodically
    this.monitoringInterval = setInterval(() => {
      this.checkAndSendReminders();
    }, intervalMinutes * 60 * 1000);
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('Scheduled payment monitoring stopped');
    }
  }
}

export default new ScheduledPaymentProcessor();
