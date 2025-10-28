// Mock data for development when backend is not available
export const mockProperties = [
  {
    id: 1,
    address: '123 Riverside Drive, Nairobi',
    units: 3,
    rent: 25000,
    occupied: true,
    occupancy: 100,
    tenant: 'John Doe',
    leaseExpiry: '15 days',
    bedrooms: 3,
    bathrooms: 2,
    image: 'https://via.placeholder.com/400x300'
  },
  {
    id: 2,
    address: '456 Garden Estate, Nairobi',
    units: 2,
    rent: 18000,
    occupied: false,
    occupancy: 50,
    tenant: null,
    leaseExpiry: 'N/A',
    bedrooms: 2,
    bathrooms: 1,
    image: 'https://via.placeholder.com/400x300'
  }
];

export const mockTenants = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+254712345678',
    property: '123 Riverside Drive',
    rentStatus: 'paid',
    leaseEnd: '2024-12-31'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+254723456789',
    property: '456 Garden Estate',
    rentStatus: 'pending',
    leaseEnd: '2024-11-30'
  }
];

export const mockPayments = [
  {
    id: 1,
    tenant: 'John Doe',
    amount: 25000,
    status: 'paid',
    date: '2024-01-01',
    dueDate: '2024-02-01',
    method: 'mpesa'
  },
  {
    id: 2,
    tenant: 'Jane Smith',
    amount: 18000,
    status: 'pending',
    dueDate: '2024-02-05',
    method: 'bank'
  }
];

export const mockMaintenance = [
  {
    id: 1,
    description: 'Leaking faucet in kitchen',
    property: '123 Riverside Drive',
    status: 'pending',
    priority: 'medium',
    category: 'plumbing',
    date: '2024-01-15',
    time: '2 hours ago',
    title: 'Maintenance Request',
    icon: 'fa-tools'
  },
  {
    id: 2,
    description: 'Broken AC unit',
    property: '456 Garden Estate',
    status: 'in_progress',
    priority: 'high',
    category: 'hvac',
    date: '2024-01-14',
    time: '1 day ago',
    title: 'Maintenance In Progress',
    icon: 'fa-wrench'
  },
  {
    id: 3,
    description: 'Paint touch-up needed',
    property: '123 Riverside Drive',
    status: 'completed',
    priority: 'low',
    category: 'general',
    date: '2024-01-10',
    time: '5 days ago',
    title: 'Maintenance Completed',
    icon: 'fa-check-circle'
  }
];

export const mockUser = {
  id: 1,
  name: 'John Kamau',
  email: 'john@example.com',
  role: 'landlord',
  phone: '+254712345678'
};

// Simulate API delay
export const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));
