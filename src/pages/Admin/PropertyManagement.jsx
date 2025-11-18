import React, { useState, useEffect } from 'react';
import adminApi from '../../api/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';

const PropertyManagement = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await adminApi.getAllProperties();
      setProperties(response.properties);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading properties..." />;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Property Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div key={property.id} className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-lg mb-2">{property.address}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Type:</span> {property.type}</p>
              <p><span className="font-medium">Units:</span> {property.units}</p>
              <p><span className="font-medium">Occupancy:</span> {property.occupancy}%</p>
              <p><span className="font-medium">Owner:</span> {property.owner}</p>
            </div>
            <button className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyManagement;
