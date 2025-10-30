import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import GuestList from '../../pages/TenantDashboard/Guests/GuestList';
import RegisterGuest from '../../pages/TenantDashboard/Guests/RegisterGuest';
import apiService from '../../api/api';
import { notificationService } from '../../services/notificationService';

// Mock API service
vi.mock('../../api/api', () => ({
  default: {
    getGuests: vi.fn(),
    registerGuest: vi.fn(),
    cancelGuestRegistration: vi.fn(),
    grantRemoteAccess: vi.fn(),
  },
}));

// Mock notification service
vi.mock('../../services/notificationService', () => ({
  notificationService: {
    sendSMS: vi.fn(),
    subscribeToGuestArrivals: vi.fn(),
    unsubscribeFromGuestArrivals: vi.fn(),
  },
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

describe('E2E: Guest Registration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('should complete full guest registration workflow', async () => {
    const user = userEvent.setup();

    // Step 1: View guest list
    const mockGuests = [
      {
        id: 1,
        guestName: 'John Doe',
        guestPhone: '+254722111222',
        expectedArrival: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        accessCode: '123456',
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    ];

    apiService.getGuests.mockResolvedValue(mockGuests);

    const { rerender } = render(
      <MemoryRouter initialEntries={['/tenant-dashboard/guests']}>
        <Routes>
          <Route path="/tenant-dashboard/guests" element={<GuestList />} />
        </Routes>
      </MemoryRouter>
    );

    // Verify guest list is displayed
    await waitFor(() => {
      expect(screen.getByText(/guest management/i)).toBeInTheDocument();
    });

    // Verify existing guest is shown
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('123456')).toBeInTheDocument();

    // Step 2: Click "Register Guest" button
    const registerButton = screen.getByRole('button', { name: /register.*guest/i });
    await user.click(registerButton);

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining('/guests/register')
    );

    // Step 3: Render registration form
    const mockRegisteredGuest = {
      id: 2,
      guestName: 'Jane Smith',
      guestPhone: '+254733222333',
      expectedArrival: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      accessCode: '789012',
      codeExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    apiService.registerGuest.mockResolvedValue({
      success: true,
      guest: mockRegisteredGuest,
      message: 'Guest registered successfully',
    });

    notificationService.sendSMS.mockResolvedValue({
      success: true,
      sentAt: new Date().toISOString(),
    });

    rerender(
      <MemoryRouter initialEntries={['/tenant-dashboard/guests/register']}>
        <RegisterGuest />
      </MemoryRouter>
    );

    // Verify form is displayed
    await waitFor(() => {
      expect(screen.getByText(/register guest/i)).toBeInTheDocument();
    });

    // Step 4: Enter guest name
    const nameInput = screen.getByLabelText(/guest name/i);
    await user.type(nameInput, 'Jane Smith');

    expect(nameInput).toHaveValue('Jane Smith');

    // Step 5: Enter phone number
    const phoneInput = screen.getByLabelText(/phone number/i);
    await user.type(phoneInput, '+254733222333');

    expect(phoneInput).toHaveValue('+254733222333');

    // Verify SMS info message
    expect(screen.getByText(/access code will be sent to this number via sms/i)).toBeInTheDocument();

    // Step 6: Select arrival date
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const dateInput = screen.getByLabelText(/expected arrival date/i);
    await user.type(dateInput, tomorrowStr);

    expect(dateInput).toHaveValue(tomorrowStr);

    // Step 7: Select arrival time
    const timeInput = screen.getByLabelText(/expected arrival time/i);
    await user.type(timeInput, '14:30');

    expect(timeInput).toHaveValue('14:30');

    // Verify info box about what happens next
    expect(screen.getByText(/what happens next/i)).toBeInTheDocument();
    expect(screen.getByText(/unique 6-digit access code will be generated/i)).toBeInTheDocument();
    expect(screen.getByText(/sent to your guest via sms within 1 minute/i)).toBeInTheDocument();
    expect(screen.getByText(/access code is valid for 24 hours/i)).toBeInTheDocument();
    expect(screen.getByText(/notification when your guest arrives/i)).toBeInTheDocument();

    // Step 8: Submit registration
    const submitButton = screen.getByRole('button', { name: /register guest/i });
    await user.click(submitButton);

    // Verify API was called with correct data
    await waitFor(() => {
      expect(apiService.registerGuest).toHaveBeenCalledWith(
        expect.objectContaining({
          guestName: 'Jane Smith',
          guestPhone: '+254733222333',
          expectedArrival: expect.any(String),
        })
      );
    });

    // Step 9: Verify access code generation
    // Success modal should appear
    await waitFor(() => {
      expect(screen.getByText(/guest registered!/i)).toBeInTheDocument();
    });

    // Verify guest name in success message
    expect(screen.getByText(/jane smith has been successfully registered/i)).toBeInTheDocument();

    // Verify access code is displayed
    const accessCodeDisplay = screen.getByText('789012');
    expect(accessCodeDisplay).toBeInTheDocument();

    // Verify code validity message
    expect(screen.getByText(/valid for 24 hours/i)).toBeInTheDocument();

    // Step 10: Check SMS delivery confirmation
    // Verify SMS sent message
    const smsConfirmation = screen.getByText(/sms sent to \+254733222333/i);
    expect(smsConfirmation).toBeInTheDocument();

    // In real implementation, verify SMS was sent within 1 minute
    // For this test, we verify the API was called
    expect(apiService.registerGuest).toHaveBeenCalled();

    // Step 11: Close success modal and return to guest list
    const viewGuestListButton = screen.getByRole('button', { name: /view guest list/i });
    await user.click(viewGuestListButton);

    expect(mockNavigate).toHaveBeenCalledWith('/tenant-dashboard/guests');

    // Step 12: Verify arrival notification (simulate)
    // In real app, this would be triggered by WebSocket when guest arrives
    const updatedGuests = [
      ...mockGuests,
      {
        ...mockRegisteredGuest,
        status: 'arrived',
        arrivedAt: new Date().toISOString(),
      },
    ];

    apiService.getGuests.mockResolvedValue(updatedGuests);

    rerender(
      <MemoryRouter initialEntries={['/tenant-dashboard/guests']}>
        <GuestList />
      </MemoryRouter>
    );

    // Verify both guests are shown
    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    // Verify arrival status
    expect(screen.getByText(/arrived/i)).toBeInTheDocument();
  });

  it('should validate form fields before submission', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <RegisterGuest />
      </MemoryRouter>
    );

    // Try to submit empty form
    const submitButton = screen.getByRole('button', { name: /register guest/i });
    await user.click(submitButton);

    // Verify validation errors
    await waitFor(() => {
      expect(screen.getByText(/guest name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/phone number is required/i)).toBeInTheDocument();
      expect(screen.getByText(/expected arrival date is required/i)).toBeInTheDocument();
      expect(screen.getByText(/expected arrival time is required/i)).toBeInTheDocument();
    });

    // Verify API was not called
    expect(apiService.registerGuest).not.toHaveBeenCalled();
  });

  it('should validate phone number format', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <RegisterGuest />
      </MemoryRouter>
    );

    // Enter invalid phone number
    const phoneInput = screen.getByLabelText(/phone number/i);
    await user.type(phoneInput, '123');

    const nameInput = screen.getByLabelText(/guest name/i);
    await user.type(nameInput, 'Test Guest');

    const today = new Date().toISOString().split('T')[0];
    const dateInput = screen.getByLabelText(/expected arrival date/i);
    await user.type(dateInput, today);

    const timeInput = screen.getByLabelText(/expected arrival time/i);
    await user.type(timeInput, '10:00');

    const submitButton = screen.getByRole('button', { name: /register guest/i });
    await user.click(submitButton);

    // Verify phone validation error
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid phone number/i)).toBeInTheDocument();
    });

    expect(apiService.registerGuest).not.toHaveBeenCalled();
  });

  it('should prevent past dates for arrival', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <RegisterGuest />
      </MemoryRouter>
    );

    // Try to select yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const nameInput = screen.getByLabelText(/guest name/i);
    await user.type(nameInput, 'Test Guest');

    const phoneInput = screen.getByLabelText(/phone number/i);
    await user.type(phoneInput, '+254722111222');

    const dateInput = screen.getByLabelText(/expected arrival date/i);
    await user.type(dateInput, yesterdayStr);

    const timeInput = screen.getByLabelText(/expected arrival time/i);
    await user.type(timeInput, '10:00');

    const submitButton = screen.getByRole('button', { name: /register guest/i });
    await user.click(submitButton);

    // Verify date validation error
    await waitFor(() => {
      expect(screen.getByText(/arrival date cannot be in the past/i)).toBeInTheDocument();
    });

    expect(apiService.registerGuest).not.toHaveBeenCalled();
  });

  it('should display access code with correct format', async () => {
    const user = userEvent.setup();

    const mockGuest = {
      id: 1,
      guestName: 'Test Guest',
      guestPhone: '+254722111222',
      accessCode: '123456',
      expectedArrival: new Date().toISOString(),
    };

    apiService.registerGuest.mockResolvedValue({
      success: true,
      guest: mockGuest,
    });

    render(
      <MemoryRouter>
        <RegisterGuest />
      </MemoryRouter>
    );

    // Fill and submit form
    const nameInput = screen.getByLabelText(/guest name/i);
    await user.type(nameInput, 'Test Guest');

    const phoneInput = screen.getByLabelText(/phone number/i);
    await user.type(phoneInput, '+254722111222');

    const today = new Date().toISOString().split('T')[0];
    const dateInput = screen.getByLabelText(/expected arrival date/i);
    await user.type(dateInput, today);

    const timeInput = screen.getByLabelText(/expected arrival time/i);
    await user.type(timeInput, '10:00');

    const submitButton = screen.getByRole('button', { name: /register guest/i });
    await user.click(submitButton);

    // Verify access code is 6 digits
    await waitFor(() => {
      const accessCode = screen.getByText('123456');
      expect(accessCode).toBeInTheDocument();
    });

    // Verify code format (should be displayed prominently)
    const codeDisplay = screen.getByText('123456');
    expect(codeDisplay).toHaveClass('text-4xl', 'font-bold');
  });

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup();

    apiService.registerGuest.mockRejectedValue(
      new Error('Network error: Unable to register guest')
    );

    render(
      <MemoryRouter>
        <RegisterGuest />
      </MemoryRouter>
    );

    // Fill form
    const nameInput = screen.getByLabelText(/guest name/i);
    await user.type(nameInput, 'Test Guest');

    const phoneInput = screen.getByLabelText(/phone number/i);
    await user.type(phoneInput, '+254722111222');

    const today = new Date().toISOString().split('T')[0];
    const dateInput = screen.getByLabelText(/expected arrival date/i);
    await user.type(dateInput, today);

    const timeInput = screen.getByLabelText(/expected arrival time/i);
    await user.type(timeInput, '10:00');

    // Mock window.alert
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const submitButton = screen.getByRole('button', { name: /register guest/i });
    await user.click(submitButton);

    // Verify error alert
    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(
        expect.stringMatching(/failed to register guest/i)
      );
    });

    alertMock.mockRestore();
  });

  it('should allow canceling registration', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <RegisterGuest />
      </MemoryRouter>
    );

    // Click cancel button
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Verify navigation back to guest list
    expect(mockNavigate).toHaveBeenCalledWith('/tenant-dashboard/guests');

    // Verify API was not called
    expect(apiService.registerGuest).not.toHaveBeenCalled();
  });

  it('should show loading state during submission', async () => {
    const user = userEvent.setup();

    // Make API call slow
    apiService.registerGuest.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        success: true,
        guest: {
          id: 1,
          guestName: 'Test Guest',
          accessCode: '123456',
        },
      }), 1000))
    );

    render(
      <MemoryRouter>
        <RegisterGuest />
      </MemoryRouter>
    );

    // Fill form
    const nameInput = screen.getByLabelText(/guest name/i);
    await user.type(nameInput, 'Test Guest');

    const phoneInput = screen.getByLabelText(/phone number/i);
    await user.type(phoneInput, '+254722111222');

    const today = new Date().toISOString().split('T')[0];
    const dateInput = screen.getByLabelText(/expected arrival date/i);
    await user.type(dateInput, today);

    const timeInput = screen.getByLabelText(/expected arrival time/i);
    await user.type(timeInput, '10:00');

    const submitButton = screen.getByRole('button', { name: /register guest/i });
    await user.click(submitButton);

    // Verify loading state
    await waitFor(() => {
      expect(screen.getByText(/registering\.\.\./i)).toBeInTheDocument();
    });

    // Verify button is disabled
    expect(submitButton).toBeDisabled();

    // Wait for completion
    await waitFor(
      () => {
        expect(screen.getByText(/guest registered!/i)).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('should display guest list with all registered guests', async () => {
    const mockGuests = [
      {
        id: 1,
        guestName: 'John Doe',
        guestPhone: '+254722111222',
        expectedArrival: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        accessCode: '123456',
        status: 'pending',
      },
      {
        id: 2,
        guestName: 'Jane Smith',
        guestPhone: '+254733222333',
        expectedArrival: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        accessCode: '789012',
        status: 'arrived',
      },
      {
        id: 3,
        guestName: 'Bob Johnson',
        guestPhone: '+254744333444',
        expectedArrival: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        accessCode: '345678',
        status: 'expired',
      },
    ];

    apiService.getGuests.mockResolvedValue(mockGuests);

    render(
      <MemoryRouter>
        <GuestList />
      </MemoryRouter>
    );

    // Verify all guests are displayed
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    // Verify access codes
    expect(screen.getByText('123456')).toBeInTheDocument();
    expect(screen.getByText('789012')).toBeInTheDocument();
    expect(screen.getByText('345678')).toBeInTheDocument();

    // Verify statuses
    expect(screen.getByText(/pending/i)).toBeInTheDocument();
    expect(screen.getByText(/arrived/i)).toBeInTheDocument();
    expect(screen.getByText(/expired/i)).toBeInTheDocument();
  });
});
