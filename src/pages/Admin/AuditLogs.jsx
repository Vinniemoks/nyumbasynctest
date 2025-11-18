import React, { useState, useEffect } from 'react';
import adminApi from '../../api/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const response = await adminApi.getAuditLogs({ limit: 50 });
      setLogs(response.logs);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading audit logs..." />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-1">Track all system activities and changes</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <i className="fas fa-download mr-2"></i>
          Export Logs
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performed By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    {log.action.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.performedBy}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.targetUser}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {log.ipAddress}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;
