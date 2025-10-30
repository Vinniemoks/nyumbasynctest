import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../../api/api';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, important

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      setError(err.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (announcementId) => {
    try {
      await apiService.markAnnouncementAsRead(announcementId);
      setAnnouncements(prev =>
        prev.map(ann =>
          ann.id === announcementId ? { ...ann, read: true } : ann
        )
      );
    } catch (err) {
      console.error('Failed to mark announcement as read:', err);
    }
  };

  const filteredAnnouncements = announcements.filter(ann => {
    if (filter === 'unread') return !ann.read;
    if (filter === 'important') return ann.priority === 'high' || ann.priority === 'urgent';
    return true;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'fas fa-exclamation-circle';
      case 'high':
        return 'fas fa-exclamation-triangle';
      case 'medium':
        return 'fas fa-info-circle';
      default:
        return 'fas fa-bullhorn';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">Loading announcements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <i className="fas fa-exclamation-circle text-red-600 text-4xl mb-4"></i>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Announcements</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAnnouncements}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <i className="fas fa-redo mr-2"></i>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <i className="fas fa-bullhorn text-blue-600 mr-3"></i>
              Community Announcements
            </h1>
            <p className="text-gray-600 mt-2">Stay updated with building news and important notices</p>
          </div>
          <Link
            to="/tenant-dashboard/community/bulletin"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <i className="fas fa-comments mr-2"></i>
            Bulletin Board
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 border-b border-gray-200">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            All ({announcements.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === 'unread'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Unread ({announcements.filter(a => !a.read).length})
          </button>
          <button
            onClick={() => setFilter('important')}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === 'important'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Important ({announcements.filter(a => a.priority === 'high' || a.priority === 'urgent').length})
          </button>
        </div>
      </div>

      {/* Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <i className="fas fa-inbox text-gray-400 text-5xl mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Announcements</h3>
          <p className="text-gray-600">
            {filter === 'all'
              ? 'There are no announcements at this time.'
              : filter === 'unread'
              ? 'You have no unread announcements.'
              : 'There are no important announcements.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => (
            <div
              key={announcement.id}
              className={`bg-white border rounded-lg p-6 transition-all hover:shadow-md ${
                !announcement.read ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => !announcement.read && markAsRead(announcement.id)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`p-3 rounded-lg ${getPriorityColor(announcement.priority)}`}>
                    <i className={`${getPriorityIcon(announcement.priority)} text-xl`}></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-800">{announcement.title}</h3>
                      {!announcement.read && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <i className="fas fa-user-tie mr-1"></i>
                        {announcement.author}
                      </span>
                      <span className="flex items-center">
                        <i className="fas fa-clock mr-1"></i>
                        {formatDate(announcement.postedAt)}
                      </span>
                      {announcement.category && (
                        <span className="flex items-center">
                          <i className="fas fa-tag mr-1"></i>
                          {announcement.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="ml-16">
                <p className="text-gray-700 whitespace-pre-line">{announcement.message}</p>

                {/* Attachments */}
                {announcement.attachments && announcement.attachments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      <i className="fas fa-paperclip mr-1"></i>
                      Attachments:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {announcement.attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                          <i className="fas fa-file text-gray-600"></i>
                          <span className="text-gray-700">{attachment.name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {announcement.actionUrl && (
                  <div className="mt-4">
                    <a
                      href={announcement.actionUrl}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {announcement.actionText || 'Learn More'}
                      <i className="fas fa-arrow-right ml-2"></i>
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Common Area Issue Link */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              <i className="fas fa-tools text-blue-600 mr-2"></i>
              Notice an Issue in Common Areas?
            </h3>
            <p className="text-gray-600">Report problems in lobby, parking, gym, pool, or other shared spaces</p>
          </div>
          <Link
            to="/tenant-dashboard/community/report-issue"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center whitespace-nowrap"
          >
            <i className="fas fa-exclamation-triangle mr-2"></i>
            Report Issue
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Announcements;
