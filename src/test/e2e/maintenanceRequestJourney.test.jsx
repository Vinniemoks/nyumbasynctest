import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import MaintenanceList from '../../pages/TenantDashboard/Maintenance/MaintenanceList';
import CreateRequest from '../../pages/TenantDashboard/Maintenance/CreateRequest';
import RequestDetails from '../../pages/TenantDashboard/Maintenance/RequestDetails';
import VendorRating from '../../pages/TenantDashboard/Maintenance/VendorRating';
import apiService from '../../api/api';

// Mock API service
vi.mock('../../api/api', () => ({
  default: {
    getMaintenanceRequests: vi.fn(),
    createMaintenanceRequest: vi.fn(),
    getMaintenanceRequest: vi.fn(),
    updateMaintenanceRequest: vi.fn(),
    rateMaintenanceRequest: vi.fn(),
  },
}));

// Mock FileUploader
vi.mock('../../components/shared/FileUploader', () => ({
  default: ({ images, setImages, maxImages = 5 }) => (
    <div data-testid="file-uploader">
      <p>Upload up to {maxImages} photos (max 10MB each)</p>
      <button
        onClick={() => {
          if (images.length < maxImages) {
            const mockFile = {
              name: `test-image-${images.length + 1}.jpg`,
              url: `blob:test-url-${images.length + 1}`,
              preview: `blob:test-url-${images.length + 1}`,
              size: 1024 * 1024, // 1MB
            };
            setImages([...images, mockFile]);
          }
        }}
        disabled={images.length >= maxImages}
      >
        Upload Image
      </button>
      <div data-testid="uploaded-images">
        {images.map((img, idx) => (
          <div key={idx} data-testid={`image-${idx}`}>
            <span>{img.name}</span>
            <button
              onClick={() => {
                setImages(images.filter((_, i) => i !== idx));
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <p data-testid="image-count">{images.length} / {maxImages} images</p>
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
    useParams: () => ({ id: '123' }),
  };
});

describe('E2E: Maintenance Request Creation and Tracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('should complete full maintenance request workflow from creation to rating', async () => {
    const user = userEvent.setup();

    // Step 1: View maintenance list
    const mockRequests = [
      {
        id: 100,
        ticketNumber: 'TKT-100-001',
        category: 'electrical',
        description: 'Old request',
        status: 'completed',
        createdAt: '2024-11-01T10:00:00Z',
      },
    ];

    apiService.getMaintenanceRequests.mockResolvedValue(mockRequests);

    const { rerender } = render(
      <MemoryRouter initialEntries={['/tenant-dashboard/maintenance']}>
        <Routes>
          <Route path="/tenant-dashboard/maintenance" element={<MaintenanceList />} />
        </Routes>
      </MemoryRouter>
    );

    // Verify maintenance list is displayed
    await waitFor(() => {
      expect(screen.getByText(/maintenance requests/i)).toBeInTheDocument();
    });

    // Verify existing request is shown
    expect(screen.getByText('TKT-100-001')).toBeInTheDocument();

    // Step 2: Click "Create Request" button
    const createButton = screen.getByRole('button', { name: /create.*request/i });
    await user.click(createButton);

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining('/maintenance/create')
    );

    // Step 3: Render create request form
    apiService.createMaintenanceRequest.mockResolvedValue({
      id: 123,
      ticketNumber: 'TKT-123456-001',
      status: 'submitted',
      category: 'plumbing',
      description: 'Kitchen faucet is leaking continuously',
      priority: 'high',
      images: ['blob:test-url-1', 'blob:test-url-2'],
      createdAt: new Date().toISOString(),
    });

    rerender(
      <MemoryRouter initialEntries={['/tenant-dashboard/maintenance/create']}>
        <CreateRequest />
      </MemoryRouter>
    );

    // Verify form is displayed
    await waitFor(() => {
      expect(screen.getByText(/create maintenance request/i)).toBeInTheDocument();
    });

    // Step 4: Select category
    const plumbingButton = screen.getByRole('button', { name: /select plumbing category/i });
    await user.click(plumbingButton);

    expect(plumbingButton).toHaveAttribute('aria-pressed', 'true');

    // Step 5: Enter description
    const descriptionInput = screen.getByLabelText(/description/i);
    await user.type(descriptionInput, 'Kitchen faucet is leaking continuously');

    expect(descriptionInput).toHaveValue('Kitchen faucet is leaking continuously');

    // Step 6: Select priority
    const highPriorityRadio = screen.getByLabelText(/high priority/i);
    await user.click(highPriorityRadio);

    expect(highPriorityRadio).toBeChecked();

    // Step 7: Upload images
    const uploadButton = screen.getByText('Upload Image');
    
    // Upload first image
    await user.click(uploadButton);
    
    // Verify first image is uploaded
    await waitFor(() => {
      expect(screen.getByText('test-image-1.jpg')).toBeInTheDocument();
    });

    // Upload second image
    await user.click(uploadButton);

    // Verify second image is uploaded
    await waitFor(() => {
      expect(screen.getByText('test-image-2.jpg')).toBeInTheDocument();
    });

    // Verify image count
    const imageCount = screen.getByTestId('image-count');
    expect(imageCount).toHaveTextContent('2 / 5 images');

    // Step 8: Submit maintenance request
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
          images: expect.arrayContaining([
            expect.stringMatching(/blob:test-url/),
          ]),
        })
      );
    });

    // Verify navigation to detail page
    expect(mockNavigate).toHaveBeenCalledWith(
      '/tenant-dashboard/maintenance/123',
      expect.objectContaining({
        state: expect.objectContaining({
          message: expect.stringMatching(/submitted successfully/i),
          ticketNumber: 'TKT-123456-001',
        }),
      })
    );

    // Step 9: View request details with status updates
    const mockRequestDetails = {
      id: 123,
      ticketNumber: 'TKT-123456-001',
      category: 'plumbing',
      description: 'Kitchen faucet is leaking continuously',
      priority: 'high',
      status: 'in_progress',
      images: ['blob:test-url-1', 'blob:test-url-2'],
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
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
          note: 'Vendor is on the way',
        },
      ],
      assignedVendor: {
        id: 1,
        name: 'John Plumber',
        companyName: 'Quick Fix Plumbing',
        phone: '+254722111222',
        rating: 4.8,
        estimatedArrival: 'Within 2 hours',
      },
    };

    apiService.getMaintenanceRequest.mockResolvedValue(mockRequestDetails);

    rerender(
      <MemoryRouter initialEntries={['/tenant-dashboard/maintenance/123']}>
        <RequestDetails />
      </MemoryRouter>
    );

    // Verify request details are displayed
    await waitFor(() => {
      expect(screen.getByText('TKT-123456-001')).toBeInTheDocument();
    });

    // Verify status
    expect(screen.getByText(/in progress/i)).toBeInTheDocument();

    // Verify description
    expect(screen.getByText('Kitchen faucet is leaking continuously')).toBeInTheDocument();

    // Verify vendor information
    expect(screen.getByText('John Plumber')).toBeInTheDocument();
    expect(screen.getByText('Quick Fix Plumbing')).toBeInTheDocument();
    expect(screen.getByText('+254722111222')).toBeInTheDocument();

    // Verify status history timeline
    expect(screen.getByText(/request submitted/i)).toBeInTheDocument();
    expect(screen.getByText(/vendor assigned/i)).toBeInTheDocument();
    expect(screen.getByText(/vendor is on the way/i)).toBeInTheDocument();

    // Step 10: Simulate status update to completed
    const completedRequest = {
      ...mockRequestDetails,
      status: 'completed',
      completedAt: new Date().toISOString(),
      statusHistory: [
        ...mockRequestDetails.statusHistory,
        {
          status: 'completed',
          timestamp: new Date().toISOString(),
          note: 'Work completed successfully',
        },
      ],
    };

    apiService.getMaintenanceRequest.mockResolvedValue(completedRequest);

    // Trigger re-fetch (in real app, this would be via WebSocket)
    rerender(
      <MemoryRouter initialEntries={['/tenant-dashboard/maintenance/123']}>
        <RequestDetails />
      </MemoryRouter>
    );

    // Verify completed status
    await waitFor(() => {
      expect(screen.getByText(/completed/i)).toBeInTheDocument();
    });

    // Step 11: Rate the service
    apiService.rateMaintenanceRequest.mockResolvedValue({
      success: true,
      message: 'Thank you for your feedback!',
    });

    // Click rate service button
    const rateButton = screen.getByRole('button', { name: /rate.*service/i });
    await user.click(rateButton);

    // Verify rating modal/component appears
    await waitFor(() => {
      expect(screen.getByText(/rate.*vendor/i)).toBeInTheDocument();
    });

    // Select 5-star rating
    const starButtons = screen.getAllByRole('button', { name: /star/i });
    await user.click(starButtons[4]); // 5th star (index 4)

    // Enter feedback
    const feedbackInput = screen.getByLabelText(/feedback/i);
    await user.type(feedbackInput, 'Excellent service! Very professional and quick.');

    // Submit rating
    const submitRatingButton = screen.getByRole('button', { name: /submit rating/i });
    await user.click(submitRatingButton);

    // Verify API was called
    await waitFor(() => {
      expect(apiService.rateMaintenanceRequest).toHaveBeenCalledWith(
        123,
        5,
        'Excellent service! Very professional and quick.'
      );
    });

    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/thank you for your feedback/i)).toBeInTheDocument();
    });
  });

  it('should track status updates in real-time', async () => {
    const mockRequest = {
      id: 123,
      ticketNumber: 'TKT-123456-001',
      category: 'electrical',
      description: 'Outlet not working',
      status: 'submitted',
      statusHistory: [
        {
          status: 'submitted',
          timestamp: new Date().toISOString(),
          note: 'Request submitted',
        },
      ],
    };

    apiService.getMaintenanceRequest.mockResolvedValue(mockRequest);

    const { rerender } = render(
      <MemoryRouter initialEntries={['/tenant-dashboard/maintenance/123']}>
        <RequestDetails />
      </MemoryRouter>
    );

    // Verify initial status
    await waitFor(() => {
      expect(screen.getByText(/submitted/i)).toBeInTheDocument();
    });

    // Simulate status update (as would happen via WebSocket)
    const updatedRequest = {
      ...mockRequest,
      status: 'assigned',
      statusHistory: [
        ...mockRequest.statusHistory,
        {
          status: 'assigned',
          timestamp: new Date().toISOString(),
          note: 'Vendor assigned',
        },
      ],
      assignedVendor: {
        name: 'Jane Electrician',
        phone: '+254733222333',
      },
    };

    apiService.getMaintenanceRequest.mockResolvedValue(updatedRequest);

    // Trigger re-render
    rerender(
      <MemoryRouter initialEntries={['/tenant-dashboard/maintenance/123']}>
        <RequestDetails />
      </MemoryRouter>
    );

    // Verify updated status
    await waitFor(() => {
      expect(screen.getByText(/assigned/i)).toBeInTheDocument();
    });

    // Verify vendor information appears
    expect(screen.getByText('Jane Electrician')).toBeInTheDocument();
  });

  it('should validate form before submission', async () => {
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

    expect(apiService.createMaintenanceRequest).not.toHaveBeenCalled();
  });

  it('should handle image upload limit', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <CreateRequest />
      </MemoryRouter>
    );

    // Upload 5 images (max limit)
    const uploadButton = screen.getByText('Upload Image');
    
    for (let i = 0; i < 5; i++) {
      await user.click(uploadButton);
    }

    // Verify 5 images are uploaded
    await waitFor(() => {
      const imageCount = screen.getByTestId('image-count');
      expect(imageCount).toHaveTextContent('5 / 5 images');
    });

    // Verify upload button is disabled
    expect(uploadButton).toBeDisabled();

    // Remove one image
    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    await user.click(removeButtons[0]);

    // Verify image count decreased
    await waitFor(() => {
      const imageCount = screen.getByTestId('image-count');
      expect(imageCount).toHaveTextContent('4 / 5 images');
    });

    // Verify upload button is enabled again
    expect(uploadButton).not.toBeDisabled();
  });

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup();

    apiService.createMaintenanceRequest.mockRejectedValue(
      new Error('Network error: Unable to submit request')
    );

    render(
      <MemoryRouter>
        <CreateRequest />
      </MemoryRouter>
    );

    // Fill form
    const plumbingButton = screen.getByRole('button', { name: /select plumbing category/i });
    await user.click(plumbingButton);

    const descriptionInput = screen.getByLabelText(/description/i);
    await user.type(descriptionInput, 'Test issue');

    // Submit
    const submitButton = screen.getByRole('button', { name: /submit maintenance request/i });
    await user.click(submitButton);

    // Verify error message
    await waitFor(() => {
      expect(screen.getByText(/failed to submit maintenance request/i)).toBeInTheDocument();
    });
  });
});
