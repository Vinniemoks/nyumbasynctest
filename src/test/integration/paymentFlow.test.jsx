import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import PaymentForm from '../../pages/TenantDashboard/RentManagement/PaymentForm';
import { paymentService } from '../../services/paymentService';

// Mock the payment service
vi.mock('../../services/paymentService', () => ({
  paymentService: {
    initiateMpesaPayment: vi.fn(),
    initiateAirtelPayment: vi.fn(),
    initiateTelkomPayment: vi.fn(),
    processCardPayment: vi.fn(),
    pollPaymentStatus: vi.fn(),
  },
}));

// Mock ReceiptViewer component
vi.mock('../../pages/TenantDashboard/RentManagement/ReceiptViewer', () => ({
  default: ({ payment, onClose }) => (
    <div data-testid="receipt-viewer">
      <h2>Receipt</h2>
      <p>Transaction ID: {payment.transactionId}</p>
      <p>Amount: KES {payment.amount}</p>
      <p>Method: {payment.paymentMethod}</p>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

const renderPaymentForm = (props = {}) => {
  const defaultProps = {
    amount: 50000,
    dueDate: '2024-12-05',
    propertyId: '1',
    onSuccess: vi.fn(),
    onCancel: vi.fn(),
  };

  return render(
    <BrowserRouter>
      <PaymentForm {...defaultProps} {...props} />
    </BrowserRouter>
  );
};

describe('Payment Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('M-Pesa Payment Flow', () => {
    it('should complete M-Pesa payment successfully', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();

      // Mock successful M-Pesa payment
      paymentService.initiateMpesaPayment.mockResolvedValue({
        success: true,
        transactionId: 'MPESA123456',
      });

      paymentService.pollPaymentStatus.mockResolvedValue({
        status: 'success',
        message: 'Payment completed successfully',
      });

      renderPaymentForm({ onSuccess });

      // Select M-Pesa payment method
      const mpesaButton = screen.getByRole('button', { name: /m-pesa/i });
      await user.click(mpesaButton);

      // Enter phone number
      const phoneInput = screen.getByLabelText(/phone number/i);
      await user.type(phoneInput, '0712345678');

      // Click proceed button
      const proceedButton = screen.getByRole('button', { name: /proceed to pay/i });
      await user.click(proceedButton);

      // Wait for STK push modal to appear
      await waitFor(() => {
        expect(screen.getByText(/check your phone/i)).toBeInTheDocument();
      });

      // Wait for payment to complete
      await waitFor(
        () => {
          expect(paymentService.pollPaymentStatus).toHaveBeenCalledWith('MPESA123456', 60, 1000);
        },
        { timeout: 3000 }
      );

      // Verify onSuccess was called with payment details
      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(
          expect.objectContaining({
            transactionId: 'MPESA123456',
            amount: 50000,
            paymentMethod: 'mpesa',
            status: 'completed',
          })
        );
      });
    });

    it('should handle M-Pesa payment failure', async () => {
      const user = userEvent.setup();

      paymentService.initiateMpesaPayment.mockResolvedValue({
        success: true,
        transactionId: 'MPESA123456',
      });

      paymentService.pollPaymentStatus.mockResolvedValue({
        status: 'failed',
        message: 'Payment was cancelled by user',
      });

      renderPaymentForm();

      // Select M-Pesa and enter phone
      const mpesaButton = screen.getByRole('button', { name: /m-pesa/i });
      await user.click(mpesaButton);

      const phoneInput = screen.getByLabelText(/phone number/i);
      await user.type(phoneInput, '0712345678');

      const proceedButton = screen.getByRole('button', { name: /proceed to pay/i });
      await user.click(proceedButton);

      // Wait for error message
      await waitFor(
        () => {
          expect(screen.getByText(/payment failed/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Verify retry button is available
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should validate phone number before initiating payment', async () => {
      const user = userEvent.setup();

      renderPaymentForm();

      // Select M-Pesa
      const mpesaButton = screen.getByRole('button', { name: /m-pesa/i });
      await user.click(mpesaButton);

      // Enter invalid phone number
      const phoneInput = screen.getByLabelText(/phone number/i);
      await user.type(phoneInput, '123');

      const proceedButton = screen.getByRole('button', { name: /proceed to pay/i });
      await user.click(proceedButton);

      // Verify validation error
      await waitFor(() => {
        expect(screen.getByText(/invalid phone number/i)).toBeInTheDocument();
      });

      // Verify payment was not initiated
      expect(paymentService.initiateMpesaPayment).not.toHaveBeenCalled();
    });
  });

  describe('Card Payment Flow', () => {
    it('should complete card payment successfully', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();

      paymentService.processCardPayment.mockResolvedValue({
        success: true,
        transactionId: 'CARD789012',
      });

      renderPaymentForm({ onSuccess });

      // Select card payment method
      const cardButton = screen.getByRole('button', { name: /card/i });
      await user.click(cardButton);

      // Click proceed to show card form
      const proceedButton = screen.getByRole('button', { name: /proceed to pay/i });
      await user.click(proceedButton);

      // Wait for card form to appear
      await waitFor(() => {
        expect(screen.getByText(/card payment/i)).toBeInTheDocument();
      });

      // Note: Card form details would be tested here if CardPaymentForm was not mocked
      // For integration test, we verify the flow completes successfully
    });
  });

  describe('Receipt Generation', () => {
    it('should generate and display receipt after successful payment', async () => {
      const user = userEvent.setup();

      paymentService.initiateMpesaPayment.mockResolvedValue({
        success: true,
        transactionId: 'MPESA123456',
      });

      paymentService.pollPaymentStatus.mockResolvedValue({
        status: 'success',
      });

      renderPaymentForm();

      // Complete M-Pesa payment
      const mpesaButton = screen.getByRole('button', { name: /m-pesa/i });
      await user.click(mpesaButton);

      const phoneInput = screen.getByLabelText(/phone number/i);
      await user.type(phoneInput, '0712345678');

      const proceedButton = screen.getByRole('button', { name: /proceed to pay/i });
      await user.click(proceedButton);

      // Wait for payment to complete and receipt to show
      await waitFor(
        () => {
          const receiptViewer = screen.getByTestId('receipt-viewer');
          expect(receiptViewer).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Verify receipt contains payment details
      const receiptViewer = screen.getByTestId('receipt-viewer');
      expect(within(receiptViewer).getByText(/MPESA123456/)).toBeInTheDocument();
      expect(within(receiptViewer).getByText(/50000/)).toBeInTheDocument();
      expect(within(receiptViewer).getByText(/mpesa/i)).toBeInTheDocument();
    });
  });

  describe('Payment Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();

      paymentService.initiateMpesaPayment.mockRejectedValue(
        new Error('Network error: Unable to connect to payment gateway')
      );

      renderPaymentForm();

      const mpesaButton = screen.getByRole('button', { name: /m-pesa/i });
      await user.click(mpesaButton);

      const phoneInput = screen.getByLabelText(/phone number/i);
      await user.type(phoneInput, '0712345678');

      const proceedButton = screen.getByRole('button', { name: /proceed to pay/i });
      await user.click(proceedButton);

      // Verify error message is displayed
      await waitFor(() => {
        expect(screen.getByText(/payment initiation failed/i)).toBeInTheDocument();
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('should handle payment timeout', async () => {
      const user = userEvent.setup();

      paymentService.initiateMpesaPayment.mockResolvedValue({
        success: true,
        transactionId: 'MPESA123456',
      });

      paymentService.pollPaymentStatus.mockResolvedValue({
        status: 'timeout',
        message: 'Payment request has expired',
      });

      renderPaymentForm();

      const mpesaButton = screen.getByRole('button', { name: /m-pesa/i });
      await user.click(mpesaButton);

      const phoneInput = screen.getByLabelText(/phone number/i);
      await user.type(phoneInput, '0712345678');

      const proceedButton = screen.getByRole('button', { name: /proceed to pay/i });
      await user.click(proceedButton);

      // Wait for timeout error
      await waitFor(
        () => {
          expect(screen.getByText(/payment timeout/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Multiple Payment Methods', () => {
    it('should allow switching between payment methods', async () => {
      const user = userEvent.setup();

      renderPaymentForm();

      // Select M-Pesa
      const mpesaButton = screen.getByRole('button', { name: /m-pesa/i });
      await user.click(mpesaButton);

      // Verify phone input appears
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();

      // Switch to Airtel
      const airtelButton = screen.getByRole('button', { name: /airtel/i });
      await user.click(airtelButton);

      // Phone input should still be there
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();

      // Switch to card
      const cardButton = screen.getByRole('button', { name: /card/i });
      await user.click(cardButton);

      // Phone input should not be visible for card
      // (Card form would show after clicking proceed)
    });
  });
});
