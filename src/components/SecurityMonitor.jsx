import React from 'react';
import { useSecurityMonitor } from '../hooks/useSecurityMonitor';

/**
 * Security Monitor Component
 * Displays security violations and monitoring status (dev only)
 */
export function SecurityMonitor() {
  const { violations, isMonitoring } = useSecurityMonitor();

  // Only show in development
  if (import.meta.env.VITE_ENVIRONMENT === 'production') {
    return null;
  }

  if (!isMonitoring && violations.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-red-900 text-white p-4 rounded-lg shadow-lg max-w-md z-50">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">🔒</span>
        <h3 className="font-bold">Security Monitor</h3>
        {isMonitoring && (
          <span className="ml-auto text-xs bg-green-500 px-2 py-1 rounded">Active</span>
        )}
      </div>
      
      {violations.length > 0 && (
        <div className="mt-2 space-y-2">
          <p className="text-sm font-semibold">Violations Detected:</p>
          {violations.slice(-5).map((violation, index) => (
            <div key={index} className="text-xs bg-red-800 p-2 rounded">
              <div className="font-semibold">{violation.type}</div>
              <div className="text-gray-300">{new Date(violation.timestamp).toLocaleTimeString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
