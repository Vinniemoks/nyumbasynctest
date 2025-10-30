import apiService from '../api/api';

class NotificationService {
  constructor() {
    this.listeners = [];
  }

  // Subscribe to notifications
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners
  notify(notification) {
    this.listeners.forEach(listener => listener(notification));
  }

  // Send autopay confirmation notification (3 days before)
  async sendAutopayConfirmation(autopayData) {
    try {
      const response = await apiService.sendAutopayConfirmationNotification(autopayData);
      
      if (response.success) {
        this.notify({
          type: 'autopay_confirmation',
          title: 'Upcoming Autopay',
          message: `Your rent payment of KES ${autopayData.amount.toLocaleString()} will be automatically processed in 3 days.`,
          priority: 'medium',
          timestamp: new Date().toISOString()
        });
      }
      
      return response;
    } catch (error) {
      console.error('Error sending autopay confirmation:', error);
      throw error;
    }
  }

  // Send autopay success notification (within 10 seconds)
  async sendAutopaySuccess(paymentData) {
    try {
      const response = await apiService.sendAutopaySuccessNotification(paymentData);
      
      if (response.success) {
        this.notify({
          type: 'autopay_success',
          title: 'Autopay Successful',
          message: `Your rent payment of KES ${paymentData.amount.toLocaleString()} has been processed successfully.`,
          priority: 'high',
          timestamp: new Date().toISOString()
        });
      }
      
      return response;
    } catch (error) {
      console.error('Error sending autopay success notification:', error);
      throw error;
    }
  }

  // Send autopay failure notification (within 1 minute)
  async sendAutopayFailure(failureData) {
    try {
      const response = await apiService.sendAutopayFailureNotification(failureData);
      
      if (response.success) {
        this.notify({
          type: 'autopay_failure',
          title: 'Autopay Failed',
          message: `Your scheduled rent payment could not be processed. Please make a manual payment.`,
          priority: 'urgent',
          timestamp: new Date().toISOString(),
          actionUrl: '/tenant-dashboard/rent',
          actionText: 'Pay Now'
        });
      }
      
      return response;
    } catch (error) {
      console.error('Error sending autopay failure notification:', error);
      throw error;
    }
  }

  // Send scheduled payment reminder (24 hours before)
  async sendScheduledPaymentReminder(paymentData) {
    try {
      const response = await apiService.sendScheduledPaymentReminder(paymentData);
      
      if (response.success) {
        this.notify({
          type: 'scheduled_payment_reminder',
          title: 'Scheduled Payment Reminder',
          message: `Your scheduled rent payment will be processed tomorrow.`,
          priority: 'medium',
          timestamp: new Date().toISOString()
        });
      }
      
      return response;
    } catch (error) {
      console.error('Error sending scheduled payment reminder:', error);
      throw error;
    }
  }

  // Simulate autopay processing (for demo purposes)
  async simulateAutopayProcessing(autopayData) {
    // Step 1: Send confirmation 3 days before
    console.log('Sending autopay confirmation notification (3 days before)...');
    await this.sendAutopayConfirmation(autopayData);
    
    // Step 2: Process payment on scheduled date
    // In real implementation, this would be handled by backend scheduler
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          // Simulate payment processing
          const success = Math.random() > 0.1; // 90% success rate
          
          if (success) {
            const paymentData = {
              ...autopayData,
              transactionReference: `TXN-${Date.now()}`,
              processedAt: new Date().toISOString()
            };
            
            // Send success notification within 10 seconds
            await this.sendAutopaySuccess(paymentData);
            resolve({ success: true, payment: paymentData });
          } else {
            const failureData = {
              ...autopayData,
              reason: 'Insufficient funds',
              failedAt: new Date().toISOString()
            };
            
            // Send failure notification within 1 minute
            await this.sendAutopayFailure(failureData);
            resolve({ success: false, error: failureData });
          }
        } catch (error) {
          console.error('Error processing autopay:', error);
          resolve({ success: false, error });
        }
      }, 2000); // Simulate processing delay
    });
  }

  // Simulate scheduled payment reminder (for demo purposes)
  async simulateScheduledPaymentReminder(paymentData) {
    console.log('Sending scheduled payment reminder (24 hours before)...');
    await this.sendScheduledPaymentReminder(paymentData);
  }

  // Get all notifications
  async getNotifications() {
    try {
      return await apiService.getNotifications();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      return await apiService.markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
}

export default new NotificationService();
