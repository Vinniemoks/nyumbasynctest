import { useState, useEffect } from 'react';

const SearchFilter = ({ onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    serviceTypes: [],
    minRating: 0,
    availability: ''
  });

  const serviceTypeOptions = [
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'hvac', label: 'HVAC' },
    { value: 'air_conditioning', label: 'Air Conditioning' },
    { value: 'general_repair', label: 'General Repair' },
    { value: 'carpentry', label: 'Carpentry' },
    { value: 'painting', label: 'Painting' },
    { value: 'appliances', label: 'Appliances' },
    { value: 'refrigeration', label: 'Refrigeration' },
    { value: 'locksmith', label: 'Locksmith' },
    { value: 'security', label: 'Security' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'pest_control', label: 'Pest Control' },
    { value: 'landscaping', label: 'Landscaping' },
    { value: 'gardening', label: 'Gardening' },
    { value: 'water_heating', label: 'Water Heating' },
    { value: 'lighting', label: 'Lighting' }
  ];

  const ratingOptions = [
    { value: 0, label: 'All Ratings' },
    { value: 3, label: '3+ Stars' },
    { value: 4, label: '4+ Stars' },
    { value: 4.5, label: '4.5+ Stars' }
  ];

  const availabilityOptions = [
    { value: '', label: 'All' },
    { value: 'available', label: 'Available' },
    { value: 'busy', label: 'Busy' }
  ];

  useEffect(() => {
    // Notify parent component of filter changes
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [filters, onFilterChange]);

  const handleServiceTypeChange = (serviceType) => {
    setFilters((prev) => {
      const serviceTypes = prev.serviceTypes.includes(serviceType)
        ? prev.serviceTypes.filter((type) => type !== serviceType)
        : [...prev.serviceTypes, serviceType];
      return { ...prev, serviceTypes };
    });
  };

  const handleRatingChange = (rating) => {
    setFilters((prev) => ({ ...prev, minRating: rating }));
  };

  const handleAvailabilityChange = (availability) => {
    setFilters((prev) => ({ ...prev, availability }));
  };

  const clearFilters = () => {
    setFilters({
      serviceTypes: [],
      minRating: 0,
      availability: ''
    });
  };

  const hasActiveFilters = 
    filters.serviceTypes.length > 0 || 
    filters.minRating > 0 || 
    filters.availability !== '';

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <i className="fas fa-filter text-blue-600"></i>
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {filters.serviceTypes.length + (filters.minRating > 0 ? 1 : 0) + (filters.availability ? 1 : 0)} active
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
          </button>
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Service Types Filter */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Service Types</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {serviceTypeOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={filters.serviceTypes.includes(option.value)}
                    onChange={() => handleServiceTypeChange(option.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Minimum Rating</h4>
            <div className="flex flex-wrap gap-2">
              {ratingOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleRatingChange(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.minRating === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Filter */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Availability</h4>
            <div className="flex flex-wrap gap-2">
              {availabilityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAvailabilityChange(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.availability === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
