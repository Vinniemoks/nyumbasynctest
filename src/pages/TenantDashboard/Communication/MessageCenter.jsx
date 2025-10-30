import React, { useState, useEffect } from 'react';
import { useTenantProfile } from '../../../hooks/useTenantProfile';
import apiService from '../../../api/api';
import socketService from '../../../services/socketService';

const MessageCenter = ({ onCompose }) => {
  const { profile } = useTenantProfile();
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMessages();
    
    // Set up real-time message listener
    const handleNewMessage = (message) => {
      setMessages(prev => [message, ...prev]);
      
      // Show notification
      if (Notification.permission === 'granted') {
        new Notification('New Message', {
          body: message.message.substring(0, 100),
          icon: '/logo.png'
        });
      }
    };

    socketService.on('new_message', handleNewMessage);

    return () => {
      socketService.off('new_message', handleNewMessage);
    };
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMessages();
      setMessages(data);
      setError(null);
    } catch (err) {
      setError('Failed to load messages. Please try again.');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await apiService.markMessageAsRead(messageId);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, read: true } : msg
        )
      );
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  const handleMessageClick = (message) => {
    setSelectedMessage(message);
    if (!message.read) {
      markAsRead(message.id);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hour${Math.floor(diffInHours) !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const unreadCount = messages.filter(msg => !msg.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Message Center</h2>
            <p className="text-sm text-gray-600 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}` : 'All messages read'}
            </p>
          </div>
          <button
            onClick={onCompose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Message
          </button>
        </div>
      </div>

      {error && (
        <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchMessages}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 divide-x divide-gray-200">
        {/* Message List */}
        <div className="lg:col-span-1 overflow-y-auto max-h-[600px]">
          {messages.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p className="text-gray-500">No messages yet</p>
              <button
                onClick={onCompose}
                className="mt-4 text-blue-600 hover:text-blue-800 underline"
              >
                Send your first message
              </button>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                onClick={() => handleMessageClick(message)}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                } ${!message.read ? 'bg-blue-50/30' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${!message.read ? 'bg-blue-600' : 'bg-transparent'}`}></div>
                    <h3 className={`font-semibold text-gray-900 ${!message.read ? 'font-bold' : ''}`}>
                      {message.from}
                    </h3>
                  </div>
                  <span className="text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{message.message}</p>
                {message.subject && (
                  <p className="text-xs text-gray-500 mt-1">Re: {message.subject}</p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2 p-6">
          {selectedMessage ? (
            <div>
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{selectedMessage.subject || 'No Subject'}</h3>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="text-gray-400 hover:text-gray-600 lg:hidden"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="font-medium">{selectedMessage.from}</span>
                  <span>•</span>
                  <span>{new Date(selectedMessage.timestamp).toLocaleString()}</span>
                </div>
              </div>
              
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>

              {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Attachments</h4>
                  <div className="space-y-2">
                    {selectedMessage.attachments.map((attachment, index) => (
                      <a
                        key={index}
                        href={attachment.url}
                        download
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {attachment.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => onCompose({ replyTo: selectedMessage })}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Reply
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <svg className="w-20 h-20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p>Select a message to view</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageCenter;
