import { useState } from 'react';
import { Link } from 'react-router-dom';

const EvacuationMap = () => {
  const [selectedFloor, setSelectedFloor] = useState('1');
  const [showLegend, setShowLegend] = useState(true);

  const floors = [
    { id: '1', name: 'Ground Floor', units: 'Lobby, Gym, Pool' },
    { id: '2', name: 'Floor 2', units: 'Units 201-208' },
    { id: '3', name: 'Floor 3', units: 'Units 301-308' },
    { id: '4', name: 'Floor 4', units: 'Units 401-408' },
    { id: '5', name: 'Floor 5', units: 'Units 501-508' },
    { id: 'parking', name: 'Parking Level', units: 'Underground Parking' }
  ];

  const legendItems = [
    { icon: 'fas fa-door-open', label: 'Emergency Exit', color: 'green' },
    { icon: 'fas fa-fire-extinguisher', label: 'Fire Extinguisher', color: 'red' },
    { icon: 'fas fa-bell', label: 'Fire Alarm', color: 'orange' },
    { icon: 'fas fa-users', label: 'Assembly Point', color: 'blue' },
    { icon: 'fas fa-stairs', label: 'Stairwell', color: 'purple' },
    { icon: 'fas fa-first-aid', label: 'First Aid Kit', color: 'pink' }
  ];

  const assemblyPoints = [
    {
      id: 1,
      name: 'Primary Assembly Point',
      location: 'Front Parking Lot',
      description: 'Main gathering area for all residents',
      icon: 'fas fa-users',
      color: 'blue'
    },
    {
      id: 2,
      name: 'Secondary Assembly Point',
      location: 'Back Garden Area',
      description: 'Alternative gathering area if primary is inaccessible',
      icon: 'fas fa-users',
      color: 'green'
    }
  ];

  const evacuationProcedures = [
    {
      step: 1,
      title: 'Stay Calm',
      description: 'Remain calm and alert. Do not panic.',
      icon: 'fas fa-brain'
    },
    {
      step: 2,
      title: 'Alert Others',
      description: 'Alert others in your unit and nearby units if safe to do so.',
      icon: 'fas fa-bullhorn'
    },
    {
      step: 3,
      title: 'Use Stairs',
      description: 'Use stairs only. Never use elevators during an emergency.',
      icon: 'fas fa-stairs'
    },
    {
      step: 4,
      title: 'Follow Exit Signs',
      description: 'Follow illuminated exit signs to the nearest emergency exit.',
      icon: 'fas fa-sign'
    },
    {
      step: 5,
      title: 'Go to Assembly Point',
      description: 'Proceed to the designated assembly point and wait for instructions.',
      icon: 'fas fa-map-marker-alt'
    },
    {
      step: 6,
      title: 'Report to Safety Officer',
      description: 'Check in with the safety officer to confirm you are safe.',
      icon: 'fas fa-clipboard-check'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Building Evacuation Map</h1>
            <p className="text-gray-600 mt-1">View evacuation routes and emergency equipment locations</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/tenant-dashboard/emergency"
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
            >
              <i className="fas fa-arrow-left"></i>
              Back
            </Link>
            <button
              onClick={() => window.print()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <i className="fas fa-print"></i>
              Print Map
            </button>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
        <div className="flex items-start">
          <i className="fas fa-exclamation-triangle text-red-500 text-xl mt-0.5 mr-3"></i>
          <div>
            <h3 className="text-red-800 font-semibold">Emergency Evacuation</h3>
            <p className="text-red-700 text-sm mt-1">
              In case of fire or emergency, use stairs only. Never use elevators. Proceed to the nearest assembly point and wait for further instructions.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Floor Selection and Map */}
        <div className="lg:col-span-2 space-y-6">
          {/* Floor Selector */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Select Floor</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {floors.map((floor) => (
                <button
                  key={floor.id}
                  onClick={() => setSelectedFloor(floor.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedFloor === floor.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold text-gray-900">{floor.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{floor.units}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Floor Plan Display */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {floors.find(f => f.id === selectedFloor)?.name} - Evacuation Routes
              </h2>
              <button
                onClick={() => setShowLegend(!showLegend)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {showLegend ? 'Hide' : 'Show'} Legend
              </button>
            </div>

            {/* Legend */}
            {showLegend && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-3">Map Legend</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {legendItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <i className={`${item.icon} text-${item.color}-600`}></i>
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Floor Plan Placeholder */}
            <div className="relative bg-gray-100 rounded-lg p-8 min-h-[400px] flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <i className="fas fa-map text-gray-400 text-6xl mb-4"></i>
                <p className="text-gray-600 font-medium mb-2">
                  {floors.find(f => f.id === selectedFloor)?.name} Floor Plan
                </p>
                <p className="text-sm text-gray-500 max-w-md">
                  Interactive floor plan showing evacuation routes, emergency exits, fire extinguishers, and assembly points would be displayed here.
                </p>
                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <i className="fas fa-door-open"></i>
                    <span className="text-sm">4 Emergency Exits</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-red-600">
                    <i className="fas fa-fire-extinguisher"></i>
                    <span className="text-sm">6 Fire Extinguishers</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-purple-600">
                    <i className="fas fa-stairs"></i>
                    <span className="text-sm">2 Stairwells</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <i className="fas fa-info-circle mr-2"></i>
                <strong>Note:</strong> Actual floor plans with detailed evacuation routes are available at the building management office and posted on each floor near elevators.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar - Assembly Points and Procedures */}
        <div className="space-y-6">
          {/* Assembly Points */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Assembly Points</h2>
            <div className="space-y-4">
              {assemblyPoints.map((point) => (
                <div key={point.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 bg-${point.color}-100 rounded-full flex items-center justify-center flex-shrink-0`}>
                      <i className={`${point.icon} text-${point.color}-600`}></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{point.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{point.location}</p>
                      <p className="text-xs text-gray-500 mt-1">{point.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Equipment Locations */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Emergency Equipment</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <i className="fas fa-fire-extinguisher text-red-600 text-xl"></i>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Fire Extinguishers</p>
                  <p className="text-xs text-gray-600">Located near stairwells on each floor</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <i className="fas fa-bell text-orange-600 text-xl"></i>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Fire Alarms</p>
                  <p className="text-xs text-gray-600">Pull stations at each exit</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg">
                <i className="fas fa-first-aid text-pink-600 text-xl"></i>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">First Aid Kits</p>
                  <p className="text-xs text-gray-600">Lobby, gym, and each floor</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/tenant-dashboard/emergency/report"
                className="flex items-center gap-3 p-3 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <i className="fas fa-exclamation-triangle text-red-600"></i>
                <span className="font-medium text-gray-900">Report Emergency</span>
              </Link>
              <Link
                to="/tenant-dashboard/emergency"
                className="flex items-center gap-3 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <i className="fas fa-phone text-blue-600"></i>
                <span className="font-medium text-gray-900">Emergency Contacts</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Evacuation Procedures */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Evacuation Procedures</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {evacuationProcedures.map((procedure) => (
            <div key={procedure.step} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {procedure.step}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{procedure.title}</h3>
                <p className="text-sm text-gray-600">{procedure.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Safety Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Safety Reminders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Do:</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <i className="fas fa-check-circle text-green-500 mt-0.5"></i>
                <span>Familiarize yourself with all exit routes</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <i className="fas fa-check-circle text-green-500 mt-0.5"></i>
                <span>Keep exit paths clear of obstructions</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <i className="fas fa-check-circle text-green-500 mt-0.5"></i>
                <span>Close doors behind you when evacuating</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <i className="fas fa-check-circle text-green-500 mt-0.5"></i>
                <span>Assist others if it is safe to do so</span>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Don't:</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <i className="fas fa-times-circle text-red-500 mt-0.5"></i>
                <span>Use elevators during an emergency</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <i className="fas fa-times-circle text-red-500 mt-0.5"></i>
                <span>Return to your unit once evacuated</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <i className="fas fa-times-circle text-red-500 mt-0.5"></i>
                <span>Stop to collect belongings</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <i className="fas fa-times-circle text-red-500 mt-0.5"></i>
                <span>Block emergency vehicles or personnel</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvacuationMap;
