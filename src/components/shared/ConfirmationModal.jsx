import { useEffect } from 'react';
import FocusTrap from './FocusTrap';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'default', // 'default', 'danger', 'warning', 'success'
  icon = null,
  loading = false
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, loading, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const typeConfig = {
    default: {
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      icon: 'fa-info-circle',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
      buttonText: 'text-white'
    },
    danger: {
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      icon: 'fa-exclamation-triangle',
      buttonBg: 'bg-red-600 hover:bg-red-700',
      buttonText: 'text-white'
    },
    warning: {
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      icon: 'fa-exclamation-circle',
      buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
      buttonText: 'text-white'
    },
    success: {
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      icon: 'fa-check-circle',
      buttonBg: 'bg-green-600 hover:bg-green-700',
      buttonText: 'text-white'
    }
  };

  const config = typeConfig[type] || typeConfig.default;

  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity"
      onClick={handleCancel}
      role="presentation"
    >
      <FocusTrap active={isOpen}>
        <div
          className="bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all"
          onClick={(e) => e.stopPropagation()}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          {/* Modal Content */}
          <div className="p-6">
          {/* Icon */}
          <div className="flex items-center justify-center mb-4" aria-hidden="true">
            <div className={`w-16 h-16 rounded-full ${config.iconBg} flex items-center justify-center`}>
              <i className={`fas ${icon || config.icon} text-3xl ${config.iconColor}`}></i>
            </div>
          </div>

          {/* Title */}
          <h2
            id="modal-title"
            className="text-xl font-semibold text-gray-900 text-center mb-2"
          >
            {title}
          </h2>

          {/* Message */}
          <p id="modal-description" className="text-gray-600 text-center mb-6">
            {message}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3" role="group" aria-label="Confirmation actions">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`${cancelText} and close dialog`}
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${config.buttonBg} ${config.buttonText} flex items-center justify-center gap-2`}
              aria-label={loading ? 'Processing...' : `${confirmText} action`}
              aria-busy={loading}
            >
              {loading && <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>}
              {confirmText}
            </button>
          </div>
          </div>
        </div>
      </FocusTrap>
    </div>
  );
};

export default ConfirmationModal;
