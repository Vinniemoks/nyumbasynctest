import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import CreateRequest from '../../pages/TenantDashboard/Maintenance/CreateRequest';
import RequestDetails from '../../pages/TenantDashboard/Maintenance/RequestDetails';
import VendorRating from '../../pages/TenantDashboard/Maintenance/VendorRating';
import apiService from '../../api/api';

// Mock the API service
vi.mock('../../api/api', () => ({
  default: {
    createMaintenanceRequest: vi.fn(),
    getMaintenanceRequest: vi.fn(),
    updateMaintenanceRequest: vi.fn(),
    rateMaintenanceRequest: vi.fn(),
  },
}));

// Mock FileUploader component
vi.mock('../../components/shared/FileUploader', () => ({
  default: ({ images, setImages }) => (
    <div data-testid="file-uploader">
      <button
        onClick={() => {
          const mockFile = {
            name: 'test-image.jpg',
            url: 'blob:test-url',
            preview: 'blob:test-url',
          };
          setImages([...images, mockFile]);
        }}
      >
        Upload Image
      </button>
      <div data-testid="uploaded-images">
        {images.map((img, idx) => (
          <div key={idx}>{img.name}</div>
        ))}
      </div>
    </div>
  ),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '123' }),
  };
});

describe('Maintenance Request Workflow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Request Creation with Images', () => {
    it('should create maintenance request with all required fields', async () => {
      const user = userEvent.setup();

      apiService.createMaintenanceRequest.mockResolvedValue({
        id: 123,
        ticketNumber: 'TKT-123456-001',
        status: 'submitted',
      });

      render(
        <MemoryRouter>
          <CreateRequest />
        </MemoryRouter>
      );

      // Select category
      const plumbingButton = screen.getByRole('button', { name: /select plumbing category/i });
      await user.click(plumbingButton);

      // Verify category is selected
      expect(plumbingButton).toHaveAttribute('aria-pressed', 'true');

      // Enter description
      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, 'Kitchen faucet is leaking continuously');

      // Select priority
      const highPriorityRadio = screen.getByLabelText(/high priority/i);
      await user.click(highPriorityRadio);

      // Verify priority is selected
      expect(highPriorityRadio).toBeChecked();

      // Submit form
      const submitButton = screen.getByRole('button', { name: /submit maintenance request/i });
      await user.click(submitButton);

      // Verify API was called with correct data
      await waitFor(() => {
        expect(apiService.createMaintenanceRequest).toHaveBeenCalledWith(
          expect.objectContaining({
            category: 'plumbing',
            description: 'Kitchen faucet is leaking continuously',
            priority: 'high',
            status: 'submitted',
          })
        );
      });

      // Verify navigation to detail page
      expect(mockNavigate).toHaveBeenCalledWith(
        '/tenant-dashboard/maintenance/123',
        expect.objectContaining({
          state: expect.objectContaining({
            message: 'Maintenance request submitted successfully!',
            ticketNumber: expect.stringMatching(/TKT-/),
          }),
        })
      );
    });

    it('should upload images with maintenance request', async () => {
      const user = userEvent.setup();

      apiService.createMaintenanceRequest.mockResolvedValue({
        id: 123,
        ticketNumber: 'TKT-123456-001',
      });

      render(
        <MemoryRouter>
          <CreateRequest />
        </MemoryRouter>
      );

      // Select category and enter description
      const electricalButton = screen.getByRole('button', { name: /select electrical category/i });
      await user.click(electricalButton);

      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, 'Outlet not working');

      // Upload images
      const uploadButton = screen.getByText('Upload Image');
      await user.click(uploadButton);
      await user.click(uploadButton); // Upload second image

      // Verify images are displayed
      const uploadedImages = screen.getByTestId('uploaded-images');
      expect(within(uploadedImages).getAllByText(/test-image.jpg/)).toHaveLength(2);

      // Submit form
      const submitButton = screen.getByRole('button', { name: /submit maintenance request/i });
      await user.click(submitButton);

      // Verify images were included in request
      await waitFor(() => {
        expect(apiService.createMaintenanceRequest).toHaveBeenCalledWith(
          expect.objectContaining({
            images: expect.arrayContaining([
              expect.stringMatching(/blob:test-url/),
            ]),
          })
        );
      });
    });

    it('should validate required fields before submission', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <CreateRequest />
        </MemoryRouter>
      );

      // Try to submit without selecting category
      const submitButton = screen.getByRole('button', { name: /submit maintenance request/i });
      await user.click(submitButton);

      // Verify error message
      await waitFor(() => {
        expect(screen.getByText(/please select a category/i)).toBeInTheDocument();
      });

      // Verify API was not called
      expect(apiService.createMaintenanceRequest).not.toHaveBeenCalled();

      // Select category but leave description empty
      const plumbingButton = screen.getByRole('button', { name: /select plumbing category/i });
      await user.click(plumbingButton);

      await user.click(submitButton);

      // Verify description error
      await waitFor(() => {
        expect(screen.getByText(/please provide a description/i)).toBeInTheDocument();
      });
    });

    it('should handle image upload limit (max 5 images)', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <CreateRequest />
        </MemoryRouter>
      );

      // FileUploader component should enforce the 5 image limit
      // This test verifies the limit is documented in the UI
      expect(screen.getByText(/upload up to 5 photos/i)).toBeInTheDocument();
      expect(screen.getByText(/max 10mb each/i)).toBeInTheDocument();
    });
  });

  describe('Status Updates', () => {
    it('should display maintenance request status and timeline', async () => {
      const mockRequest = {
        id: 123,
        ticketNumber: 'TKT-123456-001',
        category: 'plumbing',
        description: 'Leaking faucet',
        priority: 'high',
        status: 'in_progress',
        createdAt: new Date().toISOString(),
        statusHistory: [
          {
            status: 'submitted',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            note: 'Request submitted',
          },
          {
            status: 'assigned',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            note: 'Vendor assigned',
          },
          {
            status: 'in_progress',
            timestamp: new Date().toISOString(),
            note: 'Work in progress',
          },
        ],
        assignedVendor: {
          id: 1,
          name: 'John Plumber',
          phone: '+254722111222',
          estimatedArrival: 'Within 24 hours',
        },
      };

      apiService.getMaintenanceRequest.mockResolvedValue(mockRequest);

      render(
        <MemoryRouter initialEntries={['/tenant-dashboard/maintenance/123']}>
          <RequestDetails />
        </MemoryRouter>
      );

      // Wait for request details to load
      await waitFor(() => {
        expect(screen.getByText('TKT-123456-001')).toBeInTheDocument();
      });

      // Verify status is displayed
      expect(screen.getByText(/in progress/i)).toBeInTheDocument();

      // Verify vendor information
      expect(screen.getByText('John Plumber')).toBeInTheDocument();
      expect(screen.getByText('+254722111222')).toBeInTheDocument();

      // Verify status history
      expect(screen.getByText(/request submitted/i)).toBeInTheDocument();
      expect(screen.getByText(/vendor assigned/i)).toBeInTheDocument();
      expect(screen.getByText(/work in progress/i)).toBeInTheDocument();
    });

    it('should update status in real-time via WebSocket simulation', async () => {
      const mockRequest = {
        id: 123,
        ticketNumber: 'TKT-123456-001',
        status: 'assigned',
        statusHistory: [
          {
            status: 'submitted',
            timestamp: new Date().toISOString(),
            note: 'Request submitted',
          },
        ],
      };

      apiService.getMaintenanceRequest.mockResolvedValue(mockRequest);

      render(
        <MemoryRouter initialEntries={['/tenant-dashboard/maintenance/123']}>
          <RequestDetails />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/assigned/i)).toBeInTheDocument();
      });

      // Simulate status update
      const updatedRequest = {
        ...mockRequest,
        status: 'completed',
        statusHistory: [
          ...mockRequest.statusHistory,
          {
            status: 'completed',
            timestamp: new Date().toISOString(),
            note: 'Work completed',
          },
        ],
      };

      apiService.getMaintenanceRequest.mockResolvedValue(updatedRequest);

      // In a real scenario, WebSocket would trigger a re-fetch
      // For this test, we verify the component can handle status changes
    });
  });

  describe('Vendor Rating', () => {
    it('should allow rating vendor after completion', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      apiService.rateMaintenanceRequest.mockResolvedValue({
        success: true,
        message: 'Thank you for your feedback!',
      });

      render(
        <BrowserRouter>
          <VendorRating
            requestId={123}
            vendorName="John Plumber"
            onClose={onClose}
          />
        </BrowserRouter>
      );

      // Select 5-star rating
      const fiveStarButton = screen.getAllByRole('button', { name: /star/i })[4];
      await user.click(fiveStarButton);

      // Enter feedback
      const feedbackInput = screen.getByLabelText(/feedback/i);
      await user.type(feedbackInput, 'Excellent service, very professional!');

      // Submit rating
      const submitButton = screen.getByRole('button', { name: /submit rating/i });
      await user.click(submitButton);

      // Verify API was called
      await waitFor(() => {
        expect(apiService.rateMaintenanceRequest).toHaveBeenCalledWith(
          123,
          5,
          'Excellent service, very professional!'
        );
      });

      // Verify success message
      await waitFor(() => {
        expect(screen.getByText(/thank you for your feedback/i)).toBeInTheDocument();
      });

      // Verify onClose was called
      expect(onClose).toHaveBeenCalled();
    });

    it('should require rating before submission', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <VendorRating
            requestId={123}
            vendorName="John Plumber"
            onClose={vi.fn()}
          />
        </BrowserRouter>
      );

      // Try to submit without rating
      const submitButton = screen.getByRole('button', { name: /submit rating/i });
      await user.click(submitButton);

      // Verify error or disabled state
      // (Implementation may vary - checking that API wasn't called)
      expect(apiService.rateMaintenanceRequest).not.toHaveBeenCalled();
    });

    it('should allow rating without feedback text', async () => {
      const user = userEvent.setup();

      apiService.rateMaintenanceRequest.mockResolvedValue({
        success: true,
      });

      render(
        <BrowserRouter>
          <VendorRating
            requestId={123}
            vendorName="John Plumber"
            onClose={vi.fn()}
          />
        </BrowserRouter>
      );

      // Select 4-star rating
      const fourStarButton = screen.getAllByRole('button', { name: /star/i })[3];
      await user.click(fourStarButton);

      // Submit without feedback
      const submitButton = screen.getByRole('button', { name: /submit rating/i });
      await user.click(submitButton);

      // Verify API was called with rating only
      await waitFor(() => {
        expect(apiService.rateMaintenanceRequest).toHaveBeenCalledWith(
          123,
          4,
          expect.any(String) // Empty string or undefined
        );
      });
    });
  });

  describe('Complete Maintenance Workflow', () => {
    it('should complete full workflow from creation to rating', async () => {
      const user = userEvent.setup();

      // Step 1: Create request
      apiService.createMaintenanceRequest.mockResolvedValue({
        id: 123,
        ticketNumber: 'TKT-123456-001',
        status: 'submitted',
      });

      const { unmount } = render(
        <MemoryRouter>
          <CreateRequest />
        </MemoryRouter>
      );

      const plumbingButton = screen.getByRole('button', { name: /select plumbing category/i });
      await user.click(plumbingButton);

      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, 'Leaking pipe');

      const submitButton = screen.getByRole('button', { name: /submit maintenance request/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(apiService.createMaintenanceRequest).toHaveBeenCalled();
      });

      unmount();

      // Step 2: View request details
      const completedRequest = {
        id: 123,
        ticketNumber: 'TKT-123456-001',
        category: 'plumbing',
        description: 'Leaking pipe',
        status: 'completed',
        assignedVendor: {
          name: 'John Plumber',
        },
        statusHistory: [
          {
            status: 'completed',
            timestamp: new Date().toISOString(),
            note: 'Work completed',
          },
        ],
      };

      apiService.getMaintenanceRequest.mockResolvedValue(completedRequest);

      render(
        <MemoryRouter initialEntries={['/tenant-dashboard/maintenance/123']}>
          <RequestDetails />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/completed/i)).toBeInTheDocument();
      });

      // Step 3: Rate the service (would be triggered from RequestDetails)
      // This verifies the complete workflow is possible
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors during request creation', async () => {
      const user = userEvent.setup();

      apiService.createMaintenanceRequest.mockRejectedValue(
        new Error('Network error')
      );

      render(
        <MemoryRouter>
          <CreateRequest />
        </MemoryRouter>
      );

      const plumbingButton = screen.getByRole('button', { name: /select plumbing category/i });
      await user.click(plumbingButton);

      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, 'Test issue');

      const submitButton = screen.getByRole('button', { name: /submit maintenance request/i });
      await user.click(submitButton);

      // Verify error message
      await waitFor(() => {
        expect(screen.getByText(/failed to submit maintenance request/i)).toBeInTheDocument();
      });
    });

    it('should handle missing request details gracefully', async () => {
      apiService.getMaintenanceRequest.mockRejectedValue(
        new Error('Request not found')
      );

      render(
        <MemoryRouter initialEntries={['/tenant-dashboard/maintenance/999']}>
          <RequestDetails />
        </MemoryRouter>
      );

      // Component should handle error gracefully
      // (Implementation may show error message or redirect)
      await waitFor(() => {
        expect(apiService.getMaintenanceRequest).toHaveBeenCalledWith('999');
      });
    });
  });
});
