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

export const mockVendors = [
  {
    id: 1,
    name: 'James Mwangi',
    companyName: 'Mwangi Plumbing Services',
    serviceTypes: ['plumbing', 'water_heating'],
    phoneNumber: '+254722111222',
    email: 'james@mwangiplumbing.co.ke',
    rating: 4.8,
    reviewCount: 45,
    availability: 'available',
    certifications: ['Licensed Plumber', 'Gas Fitting Certificate'],
    profileImage: 'https://via.placeholder.com/150',
    description: 'Professional plumbing services with over 10 years of experience. Specializing in residential and commercial plumbing repairs and installations.',
    reviews: [
      {
        id: 1,
        tenantName: 'Sarah K.',
        rating: 5,
        comment: 'Excellent service! Fixed my leaking pipes quickly and professionally.',
        date: '2024-01-10'
      },
      {
        id: 2,
        tenantName: 'David M.',
        rating: 4,
        comment: 'Good work, arrived on time and cleaned up after the job.',
        date: '2024-01-05'
      }
    ]
  },
  {
    id: 2,
    name: 'Grace Wanjiru',
    companyName: 'PowerFix Electrical',
    serviceTypes: ['electrical', 'lighting'],
    phoneNumber: '+254733222333',
    email: 'grace@powerfix.co.ke',
    rating: 4.9,
    reviewCount: 67,
    availability: 'available',
    certifications: ['Licensed Electrician', 'Safety Certified'],
    profileImage: 'https://via.placeholder.com/150',
    description: 'Certified electrical contractor providing safe and reliable electrical services for homes and businesses.',
    reviews: [
      {
        id: 1,
        tenantName: 'John D.',
        rating: 5,
        comment: 'Very professional and knowledgeable. Fixed all my electrical issues.',
        date: '2024-01-12'
      }
    ]
  },
  {
    id: 3,
    name: 'Peter Omondi',
    companyName: 'CoolAir HVAC Solutions',
    serviceTypes: ['hvac', 'air_conditioning'],
    phoneNumber: '+254744333444',
    email: 'peter@coolair.co.ke',
    rating: 4.6,
    reviewCount: 38,
    availability: 'busy',
    certifications: ['HVAC Technician', 'Refrigeration License'],
    profileImage: 'https://via.placeholder.com/150',
    description: 'Expert HVAC installation, repair, and maintenance services. Keeping your home comfortable year-round.',
    reviews: [
      {
        id: 1,
        tenantName: 'Mary N.',
        rating: 5,
        comment: 'Fixed my AC unit in no time. Great service!',
        date: '2024-01-08'
      },
      {
        id: 2,
        tenantName: 'Tom W.',
        rating: 4,
        comment: 'Professional and efficient. Highly recommend.',
        date: '2024-01-03'
      }
    ]
  },
  {
    id: 4,
    name: 'Lucy Akinyi',
    companyName: 'HomeRepair Pro',
    serviceTypes: ['general_repair', 'carpentry', 'painting'],
    phoneNumber: '+254755444555',
    email: 'lucy@homerepairpro.co.ke',
    rating: 4.7,
    reviewCount: 52,
    availability: 'available',
    certifications: ['General Contractor', 'Carpentry Certificate'],
    profileImage: 'https://via.placeholder.com/150',
    description: 'All-around home repair and maintenance services. From small fixes to major renovations.',
    reviews: [
      {
        id: 1,
        tenantName: 'James K.',
        rating: 5,
        comment: 'Did an amazing job painting my apartment. Very neat work.',
        date: '2024-01-11'
      }
    ]
  },
  {
    id: 5,
    name: 'Michael Kipchoge',
    companyName: 'ApplianceFix Kenya',
    serviceTypes: ['appliances', 'refrigeration'],
    phoneNumber: '+254766555666',
    email: 'michael@appliancefix.co.ke',
    rating: 4.5,
    reviewCount: 29,
    availability: 'available',
    certifications: ['Appliance Repair Specialist'],
    profileImage: 'https://via.placeholder.com/150',
    description: 'Specialized in repairing all types of home appliances. Fast and reliable service.',
    reviews: [
      {
        id: 1,
        tenantName: 'Anne M.',
        rating: 4,
        comment: 'Fixed my washing machine quickly. Fair pricing.',
        date: '2024-01-09'
      }
    ]
  },
  {
    id: 6,
    name: 'Daniel Mutua',
    companyName: 'SecureHome Locksmiths',
    serviceTypes: ['locksmith', 'security'],
    phoneNumber: '+254777666777',
    email: 'daniel@securehome.co.ke',
    rating: 4.9,
    reviewCount: 41,
    availability: 'available',
    certifications: ['Licensed Locksmith', 'Security Systems Certified'],
    profileImage: 'https://via.placeholder.com/150',
    description: '24/7 locksmith and security services. Emergency lockout assistance available.',
    reviews: [
      {
        id: 1,
        tenantName: 'Robert L.',
        rating: 5,
        comment: 'Came quickly when I was locked out. Very professional.',
        date: '2024-01-13'
      }
    ]
  },
  {
    id: 7,
    name: 'Catherine Njeri',
    companyName: 'CleanPro Services',
    serviceTypes: ['cleaning', 'pest_control'],
    phoneNumber: '+254788777888',
    email: 'catherine@cleanpro.co.ke',
    rating: 4.8,
    reviewCount: 73,
    availability: 'available',
    certifications: ['Professional Cleaning Certificate', 'Pest Control License'],
    profileImage: 'https://via.placeholder.com/150',
    description: 'Professional cleaning and pest control services for residential and commercial properties.',
    reviews: [
      {
        id: 1,
        tenantName: 'Susan W.',
        rating: 5,
        comment: 'Excellent deep cleaning service. My apartment looks brand new!',
        date: '2024-01-14'
      }
    ]
  },
  {
    id: 8,
    name: 'Joseph Kamau',
    companyName: 'GreenGarden Landscaping',
    serviceTypes: ['landscaping', 'gardening'],
    phoneNumber: '+254799888999',
    email: 'joseph@greengarden.co.ke',
    rating: 4.6,
    reviewCount: 34,
    availability: 'busy',
    certifications: ['Landscape Designer', 'Horticulture Certificate'],
    profileImage: 'https://via.placeholder.com/150',
    description: 'Professional landscaping and garden maintenance services. Creating beautiful outdoor spaces.',
    reviews: [
      {
        id: 1,
        tenantName: 'Emily R.',
        rating: 5,
        comment: 'Transformed my garden beautifully. Very creative!',
        date: '2024-01-07'
      }
    ]
  }
];

// Simulate API delay
export const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));
