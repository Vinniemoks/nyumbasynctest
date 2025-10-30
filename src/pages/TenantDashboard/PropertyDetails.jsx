import { useProperty } from '../../hooks/useProperty';
import { useLease } from '../../hooks/useLease';
import ImageGallery from '../../components/shared/ImageGallery';

const PropertyDetails = () => {
  const { property, loading: propertyLoading } = useProperty();
  const { lease, loading: leaseLoading } = useLease();

  const loading = propertyLoading || leaseLoading;

  // Amenity icon mapping
  const getAmenityIcon = (amenity) => {
    const amenityLower = amenity.toLowerCase();
    
    if (amenityLower.includes('parking')) return 'fas fa-parking';
    if (amenityLower.includes('pool') || amenityLower.includes('swimming')) return 'fas fa-swimming-pool';
    if (amenityLower.includes('gym') || amenityLower.includes('fitness')) return 'fas fa-dumbbell';
    if (amenityLower.includes('wifi') || amenityLower.includes('internet')) return 'fas fa-wifi';
    if (amenityLower.includes('laundry') || amenityLower.includes('washer')) return 'fas fa-tshirt';
    if (amenityLower.includes('security') || amenityLower.includes('guard')) return 'fas fa-shield-alt';
    if (amenityLower.includes('elevator') || amenityLower.includes('lift')) return 'fas fa-elevator';
    if (amenityLower.includes('balcony') || amenityLower.includes('terrace')) return 'fas fa-home';
    if (amenityLower.includes('garden') || amenityLower.includes('yard')) return 'fas fa-tree';
    if (amenityLower.includes('air') || amenityLower.includes('ac') || amenityLower.includes('conditioning')) return 'fas fa-snowflake';
    if (amenityLower.includes('heat')) return 'fas fa-fire';
    if (amenityLower.includes('pet')) return 'fas fa-paw';
    if (amenityLower.includes('storage')) return 'fas fa-box';
    if (amenityLower.includes('dishwasher')) return 'fas fa-utensils';
    if (amenityLower.includes('microwave')) return 'fas fa-microwave';
    if (amenityLower.includes('refrigerator') || amenityLower.includes('fridge')) return 'fas fa-refrigerator';
    if (amenityLower.includes('playground')) return 'fas fa-child';
    if (amenityLower.includes('bbq') || amenityLower.includes('grill')) return 'fas fa-fire-alt';
    if (amenityLower.includes('club')) return 'fas fa-building';
    if (amenityLower.includes('concierge')) return 'fas fa-concierge-bell';
    
    return 'fas fa-check-circle';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center">No property information available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Property Details</h2>

      {/* Property Images Gallery */}
      {property.images && property.images.length > 0 && (
        <ImageGallery images={property.images} />
      )}

      {/* Property Information */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center">
          <i className="fas fa-building text-blue-600 mr-2 text-base sm:text-lg"></i>
          <span className="text-base sm:text-xl">Property Information</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="flex items-start">
            <i className="fas fa-map-marker-alt text-gray-400 mt-1 mr-3"></i>
            <div>
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-medium text-gray-800">{property.address}</p>
            </div>
          </div>
          <div className="flex items-start">
            <i className="fas fa-door-open text-gray-400 mt-1 mr-3"></i>
            <div>
              <p className="text-sm text-gray-600">Unit Number</p>
              <p className="font-medium text-gray-800">{property.unitNumber || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-start">
            <i className="fas fa-home text-gray-400 mt-1 mr-3"></i>
            <div>
              <p className="text-sm text-gray-600">Property Type</p>
              <p className="font-medium text-gray-800 capitalize">{property.propertyType}</p>
            </div>
          </div>
          <div className="flex items-start">
            <i className="fas fa-ruler-combined text-gray-400 mt-1 mr-3"></i>
            <div>
              <p className="text-sm text-gray-600">Square Footage</p>
              <p className="font-medium text-gray-800">{property.squareFootage} sq ft</p>
            </div>
          </div>
          <div className="flex items-start">
            <i className="fas fa-bed text-gray-400 mt-1 mr-3"></i>
            <div>
              <p className="text-sm text-gray-600">Bedrooms</p>
              <p className="font-medium text-gray-800">{property.bedrooms}</p>
            </div>
          </div>
          <div className="flex items-start">
            <i className="fas fa-bath text-gray-400 mt-1 mr-3"></i>
            <div>
              <p className="text-sm text-gray-600">Bathrooms</p>
              <p className="font-medium text-gray-800">{property.bathrooms}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lease Information */}
      {lease && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center">
            <i className="fas fa-file-contract text-blue-600 mr-2 text-base sm:text-lg"></i>
            <span className="text-base sm:text-xl">Lease Information</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="flex items-start">
              <i className="fas fa-calendar-check text-gray-400 mt-1 mr-3"></i>
              <div>
                <p className="text-sm text-gray-600">Lease Start Date</p>
                <p className="font-medium text-gray-800">
                  {new Date(lease.startDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <i className="fas fa-calendar-times text-gray-400 mt-1 mr-3"></i>
              <div>
                <p className="text-sm text-gray-600">Lease End Date</p>
                <p className="font-medium text-gray-800">
                  {new Date(lease.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <i className="fas fa-money-bill-wave text-gray-400 mt-1 mr-3"></i>
              <div>
                <p className="text-sm text-gray-600">Monthly Rent</p>
                <p className="font-medium text-gray-800">KSh {lease.monthlyRent?.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-start">
              <i className="fas fa-shield-alt text-gray-400 mt-1 mr-3"></i>
              <div>
                <p className="text-sm text-gray-600">Security Deposit</p>
                <p className="font-medium text-gray-800">KSh {lease.securityDeposit?.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Property Stakeholder */}
      {property.stakeholder && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center">
            <i className="fas fa-user-tie text-blue-600 mr-2 text-base sm:text-lg"></i>
            <span className="text-base sm:text-xl">Property Stakeholder</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="flex items-start">
              <i className="fas fa-user text-gray-400 mt-1 mr-3"></i>
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-800">{property.stakeholder.name}</p>
              </div>
            </div>
            <div className="flex items-start">
              <i className="fas fa-envelope text-gray-400 mt-1 mr-3"></i>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-800">
                  <a href={`mailto:${property.stakeholder.email}`} className="text-blue-600 hover:underline">
                    {property.stakeholder.email}
                  </a>
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <i className="fas fa-phone text-gray-400 mt-1 mr-3"></i>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-800">
                  <a href={`tel:${property.stakeholder.phone}`} className="text-blue-600 hover:underline">
                    {property.stakeholder.phone}
                  </a>
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <i className="fas fa-id-badge text-gray-400 mt-1 mr-3"></i>
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="font-medium text-gray-800 capitalize">{property.stakeholder.role}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Amenities */}
      {property.amenities && property.amenities.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center">
            <i className="fas fa-star text-blue-600 mr-2 text-base sm:text-lg"></i>
            <span className="text-base sm:text-xl">Amenities</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {property.amenities.map((amenity, index) => (
              <div
                key={index}
                className="flex items-center px-3 sm:px-4 py-2 sm:py-3 bg-blue-50 text-blue-800 rounded-lg hover:bg-blue-100 active:bg-blue-200 transition-colors touch-manipulation"
                style={{ minHeight: '44px' }}
              >
                <i className={`${getAmenityIcon(amenity)} mr-2 sm:mr-3 text-blue-600 text-sm sm:text-base`}></i>
                <span className="font-medium text-sm sm:text-base">{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;
