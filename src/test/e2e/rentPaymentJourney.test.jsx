import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RentDashboard from '../../pages/TenantDashboard/RentManagement/RentDashboard';
import PaymentForm from '../../pages/TenantDashboard/RentManagement/PaymentForm';
import PaymentHistory from '../../pages/TenantDashboard/RentManagement/PaymentHistory';
import { paymentService } from '../../services/paymentService';
import apiService from '../../api/api';

// Mock services
vi.mock('../../services/paymentService', () => ({
  paymentService: {
    initiateMpesaPayment: vi.fn(),
    initiateAirtelPayment: vi.fn(),
    initiateTelkomPayment: vi.fn(),
    processCardPayment: vi.fn(),
    pollPaymentStatus: vi.fn(),
  },
}));

vi.mock('../../api/api', () => ({
  default: {
    getRentStatus: vi.fn(),
    getPaymentHistory: vi.fn(),
    createPayment: vi.fn(),
  },
}));

// Mock ReceiptViewer
vi.mock('../../pages/TenantDashboard/RentManagement/ReceiptViewer', () => ({
  default: ({ payment, onClose, onDownload }) => (
    <div data-testid="receipt-viewer">
      <h2>Payment Receipt</h2>
      <div data-testid="receipt-details">
        <p>Transaction ID: {payment.transactionId}</p>
        <p>Amount: KES {payment.amount.toLocaleString()}</p>
        <p>Method: {payment.paymentMethod}</p>
        <p>Date: {new Date(payment.paymentDate).toLocaleDateString()}</p>
        <p>Status: {payment.status}</p>
      </div>
      <button onClick={onDownload}>Download Receipt</button>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('E2E: Complete Rent Payment Journey', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('should complete full rent payment journey from dashboard to receipt', async () => {
    const user = userEvent.setup();

    // Mock rent status data
    const mockRentStatus = {
      currentRent: {
        amount: 50000,
        dueDate: '2024-12-05',
        status: 'due',
        daysUntilDue: 3,
      },
      property: {
        id: '1',
        address: '123 Main St, Apt 4B',
      },
    };

    apiService.getRentStatus.mockResolvedValue(mockRentStatus);

    // Step 1: Navigate to rent section and view rent dashboard
    const { rerender } = render(
      <MemoryRouter initialEntries={['/tenant-dashboard/rent']}>
        <Routes>
          <Route path="/tenant-dashboard/rent" element={<RentDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    // Verify rent dashboard displays current rent information
    await waitFor(() => {
      expect(screen.getByText(/current rent/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/50,000/)).toBeInTheDocument();
    expect(screen.getByText(/3 days/i)).toBeInTheDocument();

    // Step 2: Click "Pay Rent" button to navigate to payment form
    const payRentButton = screen.getByRole('button', { name: /pay rent/i });
    await user.click(payRentButton);

    // Verify navigation was called
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining('/payment'),
      expect.any(Object)
    );

    // Step 3: Render payment form
    const onSuccess = vi.fn();
    const onCancel = vi.fn();

    rerender(
      <MemoryRouter initialEntries={['/tenant-dashboard/rent/payment']}>
        <PaymentForm
          amount={50000}
          dueDate="2024-12-05"
          propertyId="1"
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </MemoryRouter>
    );

    // Verify payment form is displayed
    await waitFor(() => {
      expect(screen.getByText(/select payment method/i)).toBeInTheDocument();
    });

    // Step 4: Select M-Pesa payment method
    const mpesaButton = screen.getByRole('button', { name: /m-pesa/i });
    await user.click(mpesaButton);

    // Verify M-Pesa is selected
    expect(mpesaButton).toHaveAttribute('aria-pressed', 'true');

    // Step 5: Enter phone number
    const phoneInput = screen.getByLabelText(/phone number/i);
    await user.type(phoneInput, '0712345678');

    expect(phoneInput).toHaveValue('0712345678');

    // Step 6: Complete payment
    paymentService.initiateMpesaPayment.mockResolvedValue({
      success: true,
      transactionId: 'MPESA-TXN-123456',
    });

    paymentService.pollPaymentStatus.mockResolvedValue({
      status: 'success',
      message: 'Payment completed successfully',
    });

    const proceedButton = screen.getByRole('button', { name: /proceed to pay/i });
    await user.click(proceedButton);

    // Step 7: Verify STK push modal appears
    await waitFor(() => {
      expect(screen.getByText(/check your phone/i)).toBeInTheDocument();
    });

    // Step 8: Wait for payment to complete
    await waitFor(
      () => {
        expect(paymentService.pollPaymentStatus).toHaveBeenCalledWith(
          'MPESA-TXN-123456',
          expect.any(Number),
          expect.any(Number)
        );
      },
      { timeout: 3000 }
    );

    // Step 9: Verify receipt generation
    await waitFor(
      () => {
        const receiptViewer = screen.getByTestId('receipt-viewer');
        expect(receiptViewer).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Step 10: Verify receipt contains correct payment details
    const receiptDetails = screen.getByTestId('receipt-details');
    expect(within(receiptDetails).getByText(/MPESA-TXN-123456/)).toBeInTheDocument();
    expect(within(receiptDetails).getByText(/50,000/)).toBeInTheDocument();
    expect(within(receiptDetails).getByText(/mpesa/i)).toBeInTheDocument();
    expect(within(receiptDetails).getByText(/completed/i)).toBeInTheDocument();

    // Step 11: Download receipt
    const downloadButton = screen.getByRole('button', { name: /download receipt/i });
    await user.click(downloadButton);

    // Verify download was triggered (implementation would handle actual download)
    // In a real scenario, this would verify PDF generation

    // Step 12: Close receipt and verify success callback
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    // Verify onSuccess was called with payment details
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        transactionId: 'MPESA-TXN-123456',
        amount: 50000,
        paymentMethod: 'mpesa',
        status: 'completed',
      })
    );
  });

  it('should navigate to payment history and view past payments', async () => {
    const user = userEvent.setup();

    // Mock payment history data
    const mockPaymentHistory = [
      {
        id: 1,
        amount: 50000,
        paymentDate: '2024-11-05T10:30:00Z',
        paymentMethod: 'mpesa',
        transactionId: 'MPESA-TXN-001',
        status: 'completed',
      },
      {
        id: 2,
        amount: 50000,
        paymentDate: '2024-10-05T09:15:00Z',
        paymentMethod: 'card',
        transactionId: 'CARD-TXN-002',
        status: 'completed',
      },
    ];

    apiService.getPaymentHistory.mockResolvedValue(mockPaymentHistory);

    // Render payment history
    render(
      <MemoryRouter initialEntries={['/tenant-dashboard/rent/history']}>
        <PaymentHistory />
      </MemoryRouter>
    );

    // Verify payment history is displayed
    await waitFor(() => {
      expect(screen.getByText(/payment history/i)).toBeInTheDocument();
    });

    // Verify both payments are shown
    expect(screen.getByText('MPESA-TXN-001')).toBeInTheDocument();
    expect(screen.getByText('CARD-TXN-002')).toBeInTheDocument();

    // Verify amounts are displayed
    const amounts = screen.getAllByText(/50,000/);
    expect(amounts.length).toBeGreaterThanOrEqual(2);

    // Click on a payment to view receipt
    const viewReceiptButton = screen.getAllByRole('button', { name: /view receipt/i })[0];
    await user.click(viewReceiptButton);

    // Verify receipt viewer opens
    await waitFor(() => {
      expect(screen.getByTestId('receipt-viewer')).toBeInTheDocument();
    });
  });

  it('should handle payment failure and allow retry', async () => {
    const user = userEvent.setup();

    paymentService.initiateMpesaPayment.mockResolvedValue({
      success: true,
      transactionId: 'MPESA-TXN-FAIL',
    });

    paymentService.pollPaymentStatus.mockResolvedValue({
      status: 'failed',
      message: 'Payment was cancelled by user',
    });

    render(
      <MemoryRouter>
        <PaymentForm
          amount={50000}
          dueDate="2024-12-05"
          propertyId="1"
          onSuccess={vi.fn()}
          onCancel={vi.fn()}
        />
      </MemoryRouter>
    );

    // Select M-Pesa and enter phone
    const mpesaButton = screen.getByRole('button', { name: /m-pesa/i });
    await user.click(mpesaButton);

    const phoneInput = screen.getByLabelText(/phone number/i);
    await user.type(phoneInput, '0712345678');

    const proceedButton = screen.getByRole('button', { name: /proceed to pay/i });
    await user.click(proceedButton);

    // Wait for failure message
    await waitFor(
      () => {
        expect(screen.getByText(/payment failed/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Verify retry button is available
    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();

    // Click retry
    await user.click(retryButton);

    // Verify form is reset and ready for retry
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
  });

  it('should validate phone number before payment', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <PaymentForm
          amount={50000}
          dueDate="2024-12-05"
          propertyId="1"
          onSuccess={vi.fn()}
          onCancel={vi.fn()}
        />
      </MemoryRouter>
    );

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
