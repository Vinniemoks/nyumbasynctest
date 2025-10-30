import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const EmergencyContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching emergency contacts
    const fetchContacts = async () => {
      try {
        // Mock data - in production, this would come from API
        const emergencyContacts = [
          {
            id: 1,
            category: 'Security',
            name: 'Building Security',
            phone: '+254712345670',
            available: '24/7',
            icon: 'fas fa-shield-alt',
            color: 'blue'
          },
          {
            id: 2,
            category: 'Fire',
            name: 'Fire Department',
            phone: '999',
            available: '24/7',
            icon: 'fas fa-fire-extinguisher',
            color: 'red'
          },
          {
            id: 3,
            category: 'Medical',
            name: 'Emergency Medical Services',
            phone: '911',
            available: '24/7',
            icon: 'fas fa-ambulance',
            color: 'green'
          },
          {
            id: 4,
            category: 'Police',
            name: 'Police Emergency',
            phone: '999',
            available: '24/7',
            icon: 'fas fa-shield',
            color: 'indigo'
          },
          {
            id: 5,
            category: 'Property Management',
            name: 'Property Manager',
            phone: '+254722111222',
            available: 'Mon-Fri 9AM-6PM',
            icon: 'fas fa-building',
            color: 'purple'
          },
          {
            id: 6,
            category: 'Maintenance',
            name: 'Emergency Maintenance',
            phone: '+254733222333',
            available: '24/7',
            icon: 'fas fa-tools',
            color: 'orange'
          }
        ];
        
        setContacts(emergencyContacts);
      } catch (error) {
        console.error('Error fetching emergency contacts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600 border-blue-200',
      red: 'bg-red-100 text-red-600 border-red-200',
      green: 'bg-green-100 text-green-600 border-green-200',
      indigo: 'bg-indigo-100 text-indigo-600 border-indigo-200',
      purple: 'bg-purple-100 text-purple-600 border-purple-200',
      orange: 'bg-orange-100 text-orange-600 border-orange-200'
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Emergency Contacts</h1>
            <p className="text-gray-600 mt-1">Quick access to emergency services and contacts</p>
          </div>
          <Link
            to="/tenant-dashboard/emergency/report"
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-semibold"
          >
            <i className="fas fa-exclamation-triangle"></i>
            Report Emergency
          </Link>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
        <div className="flex items-start">
          <i className="fas fa-exclamation-circle text-red-500 text-xl mt-0.5 mr-3"></i>
          <div>
            <h3 className="text-red-800 font-semibold">In Case of Emergency</h3>
            <p className="text-red-700 text-sm mt-1">
              For life-threatening emergencies, always call 911 or 999 first. Then notify building security and property management.
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
          >
            <div className={`p-4 border-b-2 ${getColorClasses(contact.color)}`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getColorClasses(contact.color)}`}>
                  <i className={`${contact.icon} text-xl`}></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{contact.category}</h3>
                  <p className="text-sm text-gray-600">{contact.name}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Phone Number:</span>
                <span className="font-semibold text-gray-900">{contact.phone}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Available:</span>
                <span className="text-sm font-medium text-green-600">{contact.available}</span>
              </div>
              
              <button
                onClick={() => handleCall(contact.phone)}
                className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                  contact.color === 'red' 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <i className="fas fa-phone"></i>
                Call Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Resources */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/tenant-dashboard/emergency/report"
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
            <div>
              <h3 className="font-semibold text-gray-900">Report Emergency</h3>
              <p className="text-sm text-gray-600">Submit an emergency report</p>
            </div>
          </Link>
          
          <Link
            to="/tenant-dashboard/emergency/evacuation"
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <i className="fas fa-map-marked-alt text-blue-500 text-2xl"></i>
            <div>
              <h3 className="font-semibold text-gray-900">Evacuation Map</h3>
              <p className="text-sm text-gray-600">View building evacuation routes</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Safety Tips */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Safety Tips</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <i className="fas fa-check-circle text-green-500 mt-1"></i>
            <p className="text-gray-700">Keep emergency contact numbers saved in your phone</p>
          </div>
          <div className="flex items-start gap-3">
            <i className="fas fa-check-circle text-green-500 mt-1"></i>
            <p className="text-gray-700">Familiarize yourself with building evacuation routes</p>
          </div>
          <div className="flex items-start gap-3">
            <i className="fas fa-check-circle text-green-500 mt-1"></i>
            <p className="text-gray-700">Know the location of fire extinguishers on your floor</p>
          </div>
          <div className="flex items-start gap-3">
            <i className="fas fa-check-circle text-green-500 mt-1"></i>
            <p className="text-gray-700">Report any safety hazards to property management immediately</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyContacts;
