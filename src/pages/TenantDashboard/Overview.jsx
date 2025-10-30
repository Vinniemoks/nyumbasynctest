import { Link } from 'react-router-dom';
import { useTenantProfile } from '../../hooks/useTenantProfile';
import { useProperty } from '../../hooks/useProperty';
import { useLease } from '../../hooks/useLease';
import StatCard from '../../components/StatCard';
import LazyImage from '../../components/LazyImage';

const Overview = () => {
  const { tenant, loading: tenantLoading } = useTenantProfile();
  const { property, loading: propertyLoading } = useProperty();
  const { lease, loading: leaseLoading } = useLease();

  const loading = tenantLoading || propertyLoading || leaseLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" aria-label="Loading dashboard"></div>
        <span className="sr-only">Loading dashboard content...</span>
      </div>
    );
  }

  const daysUntilRent = lease?.daysUntilRent || 0;
  const daysUntilLeaseEnd = lease?.daysUntilEnd || 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
          Welcome back, {tenant?.firstName || 'Tenant'}!
        </h1>
      </div>

      {/* Stats Grid - Responsive: 1 col mobile, 2 cols tablet, 4 cols desktop */}
      <section aria-label="Dashboard statistics">
        <h2 className="sr-only">Account Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6" role="list">
          <StatCard
            title="Rent Due"
            value={`KSh ${lease?.monthlyRent?.toLocaleString() || 0}`}
            subtitle={`Due in ${daysUntilRent} days`}
            icon="fas fa-money-bill-wave"
            color="blue"
          />
          <StatCard
            title="Maintenance"
            value="0 Active"
            subtitle="Requests pending"
            icon="fas fa-tools"
            color="yellow"
          />
          <StatCard
            title="Documents"
            value="0"
            subtitle="Available documents"
            icon="fas fa-file-alt"
            color="purple"
          />
          <StatCard
            title="Lease End"
            value={`${daysUntilLeaseEnd} Days`}
            subtitle="Until lease expires"
            icon="fas fa-file-signature"
            color="green"
          />
        </div>
      </section>

      {/* Quick Actions - Touch-friendly buttons */}
      <section aria-label="Quick actions">
        <h2 className="sr-only">Quick Actions</h2>
        <nav className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4" aria-label="Quick action links">
          <Link
            to="/tenant-dashboard/rent"
            className="bg-blue-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition text-center touch-manipulation"
            style={{ minHeight: '44px' }}
            aria-label="Go to rent payment page"
          >
            <i className="fas fa-money-bill-wave mr-2" aria-hidden="true"></i>
            <span className="text-sm sm:text-base">Pay Rent</span>
          </Link>
          <Link
            to="/tenant-dashboard/maintenance/new"
            className="bg-green-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg hover:bg-green-700 active:bg-green-800 transition text-center touch-manipulation"
            style={{ minHeight: '44px' }}
            aria-label="Create new maintenance request"
          >
            <i className="fas fa-tools mr-2" aria-hidden="true"></i>
            <span className="text-sm sm:text-base">Request Maintenance</span>
          </Link>
          <Link
            to="/tenant-dashboard/messages"
            className="bg-purple-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg hover:bg-purple-700 active:bg-purple-800 transition text-center touch-manipulation sm:col-span-2 lg:col-span-1"
            style={{ minHeight: '44px' }}
            aria-label="Send message to property manager"
          >
            <i className="fas fa-envelope mr-2" aria-hidden="true"></i>
            <span className="text-sm sm:text-base">Send Message</span>
          </Link>
        </nav>
      </section>

      {/* Property Overview - Responsive layout */}
      {property && (
        <section aria-label="Property overview" className="bg-white rounded-lg shadow overflow-hidden">
          <h2 className="sr-only">Your Property Information</h2>
          <article className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/3">
              <LazyImage
                src={property.images?.[0] || 'https://via.placeholder.com/400x300'}
                alt={`Property image of ${property.address || 'your rental property'}`}
                className="w-full h-48 sm:h-56 md:h-64 object-cover"
              />
            </div>
            <div className="p-4 sm:p-6 md:w-2/3">
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2">
                {property.address || 'Your Property'}
              </h3>
              <div className="flex flex-wrap gap-2 mb-3 sm:mb-4" role="list" aria-label="Property features">
                <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm" role="listitem">
                  {property.bedrooms || 0} Bedrooms
                </span>
                <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm" role="listitem">
                  {property.bathrooms || 0} Bathrooms
                </span>
                <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm" role="listitem">
                  {property.squareFootage || 0} sq ft
                </span>
                {property.amenities?.slice(0, 3).map((amenity, index) => (
                  <span key={index} className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm" role="listitem">
                    {amenity}
                  </span>
                ))}
                {property.amenities?.length > 3 && (
                  <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs sm:text-sm" role="listitem">
                    +{property.amenities.length - 3} more
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                Your current rental property. Lease ends on{' '}
                {lease?.endDate ? new Date(lease.endDate).toLocaleDateString() : 'N/A'}.
              </p>
              <Link
                to="/tenant-dashboard/property"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base inline-flex items-center touch-manipulation"
                style={{ minHeight: '44px' }}
                aria-label="View detailed property information"
              >
                View Property Details →
              </Link>
            </div>
          </article>
        </section>
      )}

      {/* Recent Activity */}
      <section aria-label="Recent activity" className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Recent Activity</h2>
        <div className="space-y-3" role="list">
          <p className="text-sm sm:text-base text-gray-500 text-center py-4" role="status">No recent activity</p>
        </div>
      </section>
    </div>
  );
};

export default Overview;
