import React, { useState } from 'react';
import { useTenantProfile } from '../../../hooks/useTenantProfile';
import { useProperty } from '../../../hooks/useProperty';
import apiService from '../../../api/api';

const ComposeMessage = ({ onClose, onSuccess, replyTo = null }) => {
  const { profile } = useTenantProfile();
  const { property } = useProperty(profile?.currentPropertyId);
  
  const [formData, setFormData] = useState({
    subject: replyTo ? `Re: ${replyTo.subject || 'No Subject'}` : '',
    message: '',
    priority: 'normal'
  });
  
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.subject.trim()) {
      setError('Please enter a subject');
      return;
    }
    
    if (!formData.message.trim()) {
      setError('Please enter a message');
      return;
    }

    try {
      setSending(true);
      setError(null);

      const messageData = {
        to: property?.stakeholder?.email || 'stakeholder@example.com',
        toName: property?.stakeholder?.name || 'Property Stakeholder',
        subject: formData.subject,
        message: formData.message,
        priority: formData.priority,
        propertyId: profile?.currentPropertyId,
        replyToId: replyTo?.id || null
      };

      await apiService.sendMessage(messageData);
      
      // Show success notification
      if (onSuccess) {
        onSuccess('Message sent successfully!');
      }
      
      // Close the compose form
      if (onClose) {
        onClose();
      }
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const recipientName = property?.stakeholder?.name || 'Property Stakeholder';
  const recipientRole = property?.stakeholder?.role || 'Manager';

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {replyTo ? 'Reply to Message' : 'Compose Message'}
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Recipient Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {recipientName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{recipientName}</p>
              <p className="text-sm text-gray-600 capitalize">{recipientRole}</p>
            </div>
          </div>
        </div>

        {/* Subject */}
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
            placeholder="Enter message subject"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={sending}
            required
          />
        </div>

        {/* Priority */}
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
            disabled={sending}
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Type your message here..."
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={sending}
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            {formData.message.length} characters
          </p>
        </div>

        {replyTo && (
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-600">
            <p className="text-sm font-semibold text-gray-700 mb-2">Original Message:</p>
            <p className="text-sm text-gray-600 line-clamp-3">{replyTo.message}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={sending}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={sending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sending...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send Message
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComposeMessage;
