import React, { useState, useEffect } from 'react';
import MessageCenter from './MessageCenter';
import ComposeMessage from './ComposeMessage';
import IssueTracker from './IssueTracker';
import socketService from '../../../services/socketService';
import { useTenantProfile } from '../../../hooks/useTenantProfile';

const Communication = () => {
  const { profile } = useTenantProfile();
  const [activeTab, setActiveTab] = useState('messages');
  const [showCompose, setShowCompose] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Connect to WebSocket for real-time notifications
    if (profile?.id) {
      socketService.connect(profile.id);

      // Listen for new messages
      const handleNewMessage = (message) => {
        setUnreadCount(prev => prev + 1);
        
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification('New Message', {
            body: message.message.substring(0, 100),
            icon: '/logo.png'
          });
        }
      };

      // Listen for issue updates
      const handleIssueUpdate = (update) => {
        if (Notification.permission === 'granted') {
          new Notification('Issue Update', {
            body: `Your issue ${update.ticketNumber} has been updated`,
            icon: '/logo.png'
          });
        }
      };

      socketService.on('new_message', handleNewMessage);
      socketService.on('issue_update', handleIssueUpdate);

      // Request notification permission
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }

      return () => {
        socketService.off('new_message', handleNewMessage);
        socketService.off('issue_update', handleIssueUpdate);
      };
    }
  }, [profile]);

  const handleCompose = (options = {}) => {
    setReplyTo(options.replyTo || null);
    setShowCompose(true);
    setActiveTab('messages');
  };

  const handleComposeSuccess = (message) => {
    setSuccessMessage(message);
    setShowCompose(false);
    setReplyTo(null);
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };

  const handleComposeClose = () => {
    setShowCompose(false);
    setReplyTo(null);
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-green-800">{successMessage}</p>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-green-600 hover:text-green-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Tabs */}
      {!showCompose && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('messages')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'messages'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Messages
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('issues')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'issues'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Issue Tracker
                </div>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Content */}
      {showCompose ? (
        <ComposeMessage
          onClose={handleComposeClose}
          onSuccess={handleComposeSuccess}
          replyTo={replyTo}
        />
      ) : (
        <>
          {activeTab === 'messages' && (
            <MessageCenter onCompose={handleCompose} />
          )}
          {activeTab === 'issues' && (
            <IssueTracker />
          )}
        </>
      )}
    </div>
  );
};

export default Communication;
