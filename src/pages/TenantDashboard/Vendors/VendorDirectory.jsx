import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../../api/api';
import SearchFilter from '../../../components/shared/SearchFilter';

const VendorDirectory = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    serviceTypes: [],
    minRating: 0,
    availability: ''
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, vendors]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getVendors();
      setVendors(data);
      setFilteredVendors(data);
    } catch (err) {
      setError(err.message || 'Failed to load vendors');
      console.error('Error fetching vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...vendors];

    // Filter by service types
    if (filters.serviceTypes.length > 0) {
      filtered = filtered.filter(vendor =>
        vendor.serviceTypes.some(type => filters.serviceTypes.includes(type))
      );
    }

    // Filter by minimum rating
    if (filters.minRating > 0) {
      filtered = filtered.filter(vendor => vendor.rating >= filters.minRating);
    }

    // Filter by availability
    if (filters.availability) {
      filtered = filtered.filter(vendor => vendor.availability === filters.availability);
    }

    setFilteredVendors(filtered);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleVendorClick = (vendorId) => {
    navigate(`/tenant/vendors/${vendorId}`);
  };

  const getServiceTypeLabel = (type) => {
    const labels = {
      plumbing: 'Plumbing',
      electrical: 'Electrical',
      hvac: 'HVAC',
      air_conditioning: 'Air Conditioning',
      general_repair: 'General Repair',
      carpentry: 'Carpentry',
      painting: 'Painting',
      appliances: 'Appliances',
      refrigeration: 'Refrigeration',
      locksmith: 'Locksmith',
      security: 'Security',
      cleaning: 'Cleaning',
      pest_control: 'Pest Control',
      landscaping: 'Landscaping',
      gardening: 'Gardening',
      water_heating: 'Water Heating',
      lighting: 'Lighting'
    };
    return labels[type] || type;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <i key={`full-${i}`} className="fas fa-star text-yellow-400"></i>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <i key="half" className="fas fa-star-half-alt text-yellow-400"></i>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <i key={`empty-${i}`} className="far fa-star text-yellow-400"></i>
      );
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vendors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <i className="fas fa-exclamation-circle text-red-500 text-4xl mb-4"></i>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Vendors</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchVendors}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Directory</h1>
        <p className="text-gray-600">
          Find trusted service providers for your property maintenance needs
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8">
        <SearchFilter onFilterChange={handleFilterChange} />
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing <span className="font-semibold">{filteredVendors.length}</span> of{' '}
          <span className="font-semibold">{vendors.length}</span> vendors
        </p>
      </div>

      {/* Vendor Grid */}
      {filteredVendors.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <i className="fas fa-search text-gray-400 text-5xl mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Vendors Found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters to see more results
          </p>
          <button
            onClick={() => setFilters({ serviceTypes: [], minRating: 0, availability: '' })}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              onClick={() => handleVendorClick(vendor.id)}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer overflow-hidden border border-gray-200"
            >
              {/* Vendor Header */}
              <div className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <img
                    src={vendor.profileImage}
                    alt={vendor.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {vendor.name}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">{vendor.companyName}</p>
                    {/* Availability Badge */}
                    <span
                      className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${
                        vendor.availability === 'available'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {vendor.availability === 'available' ? 'Available' : 'Busy'}
                    </span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex space-x-1">{renderStars(vendor.rating)}</div>
                  <span className="text-sm font-semibold text-gray-900">{vendor.rating}</span>
                  <span className="text-sm text-gray-500">({vendor.reviewCount} reviews)</span>
                </div>

                {/* Service Types */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">Services</p>
                  <div className="flex flex-wrap gap-2">
                    {vendor.serviceTypes.slice(0, 3).map((type, index) => (
                      <span
                        key={index}
                        className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                      >
                        {getServiceTypeLabel(type)}
                      </span>
                    ))}
                    {vendor.serviceTypes.length > 3 && (
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                        +{vendor.serviceTypes.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-phone w-4"></i>
                    <span>{vendor.phoneNumber}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-envelope w-4"></i>
                    <span className="truncate">{vendor.email}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVendorClick(vendor.id);
                  }}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorDirectory;
