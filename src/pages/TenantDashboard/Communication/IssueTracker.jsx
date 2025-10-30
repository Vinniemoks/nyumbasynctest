import React, { useState, useEffect } from 'react';
import { useTenantProfile } from '../../../hooks/useTenantProfile';
import apiService from '../../../api/api';
import StatusBadge from '../../../components/shared/StatusBadge';

const IssueTracker = () => {
  const { profile } = useTenantProfile();
  const [issues, setIssues] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const [formData, setFormData] = useState({
    category: 'general',
    subject: '',
    description: '',
    priority: 'normal'
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const data = await apiService.getIssues();
      setIssues(data);
      setError(null);
    } catch (err) {
      setError('Failed to load issues. Please try again.');
      console.error('Error fetching issues:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateTicketNumber = () => {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `TKT-${timestamp}-${random}`;
  };

  const getEstimatedResponseTime = (category, priority) => {
    const responseMatrix = {
      maintenance: { urgent: '1 hour', high: '4 hours', normal: '24 hours', low: '48 hours' },
      billing: { urgent: '2 hours', high: '8 hours', normal: '24 hours', low: '48 hours' },
      general: { urgent: '4 hours', high: '12 hours', normal: '48 hours', low: '72 hours' }
    };
    
    return responseMatrix[category]?.[priority] || '48 hours';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const ticketNumber = generateTicketNumber();
      const estimatedResponseTime = getEstimatedResponseTime(formData.category, formData.priority);

      const issueData = {
        ticketNumber,
        category: formData.category,
        subject: formData.subject,
        description: formData.description,
        priority: formData.priority,
        status: 'open',
        propertyId: profile?.currentPropertyId,
        estimatedResponseTime,
        createdAt: new Date().toISOString()
      };

      const newIssue = await apiService.createIssue(issueData);
      setIssues(prev => [newIssue, ...prev]);
      
      setFormData({
        category: 'general',
        subject: '',
        description: '',
        priority: 'normal'
      });
      
      setShowCreateForm(false);
      setSelectedIssue(newIssue);
    } catch (err) {
      setError('Failed to create issue. Please try again.');
      console.error('Error creating issue:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredIssues = issues.filter(issue => {
    if (filter === 'all') return true;
    if (filter === 'open') return issue.status === 'open' || issue.status === 'in_progress';
    if (filter === 'closed') return issue.status === 'resolved' || issue.status === 'closed';
    return true;
  });

  const getCategoryIcon = (category) => {
    const icons = {
      maintenance: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      billing: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      general: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      )
    };
    return icons[category] || icons.general;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Issue Tracker</h2>
            <p className="text-sm text-gray-600 mt-1">
              Track and manage your property-related issues
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Issue
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Issues ({issues.length})
          </button>
          <button
            onClick={() => setFilter('open')}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === 'open'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Open ({issues.filter(i => i.status === 'open' || i.status === 'in_progress').length})
          </button>
          <button
            onClick={() => setFilter('closed')}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === 'closed'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Closed ({issues.filter(i => i.status === 'resolved' || i.status === 'closed').length})
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Create Issue Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Issue</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={submitting}
                  required
                >
                  <option value="maintenance">Maintenance</option>
                  <option value="billing">Billing</option>
                  <option value="general">General Inquiry</option>
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={submitting}
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Brief description of the issue"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={submitting}
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide detailed information about the issue"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={submitting}
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating...' : 'Create Issue'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Issues List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Issue Cards */}
        <div className="lg:col-span-1 space-y-4">
          {filteredIssues.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500">No issues found</p>
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => setSelectedIssue(issue)}
                className={`bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow ${
                  selectedIssue?.id === issue.id ? 'ring-2 ring-blue-600' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="text-gray-600">
                      {getCategoryIcon(issue.category)}
                    </div>
                    <span className="text-xs font-mono text-gray-500">{issue.ticketNumber}</span>
                  </div>
                  <StatusBadge status={issue.status} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{issue.subject}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{issue.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="capitalize">{issue.category}</span>
                  <span>{formatTimestamp(issue.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Issue Details */}
        <div className="lg:col-span-2">
          {selectedIssue ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">{selectedIssue.subject}</h3>
                    <StatusBadge status={selectedIssue.status} />
                  </div>
                  <p className="text-sm text-gray-600">Ticket: {selectedIssue.ticketNumber}</p>
                </div>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="text-gray-400 hover:text-gray-600 lg:hidden"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-semibold text-gray-900 capitalize">{selectedIssue.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Priority</p>
                    <p className="font-semibold text-gray-900 capitalize">{selectedIssue.priority}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-semibold text-gray-900">{formatTimestamp(selectedIssue.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estimated Response</p>
                    <p className="font-semibold text-gray-900">{selectedIssue.estimatedResponseTime}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedIssue.description}</p>
                </div>

                {selectedIssue.response && (
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Response</h4>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-gray-700">{selectedIssue.response}</p>
                      <p className="text-sm text-gray-600 mt-2">
                        {formatTimestamp(selectedIssue.responseAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <svg className="w-20 h-20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Select an issue to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueTracker;
