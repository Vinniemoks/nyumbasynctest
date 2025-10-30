import React from 'react';

const ErrorDisplay = ({ 
  error, 
  onRetry, 
  onDismiss,
  showDetails = false 
}) => {
  if (!error) return null;

  const getIcon = () => {
    switch (error.type) {
      case 'network':
        return 'fas fa-wifi-slash';
      case 'auth':
        return 'fas fa-lock';
      case 'forbidden':
        return 'fas fa-ban';
      case 'not_found':
        return 'fas fa-search';
      case 'server':
        return 'fas fa-server';
      case 'validation':
        return 'fas fa-exclamation-circle';
      default:
        return 'fas fa-exclamation-triangle';
    }
  };

  const getColor = () => {
    switch (error.type) {
      case 'network':
        return 'orange';
      case 'auth':
      case 'forbidden':
        return 'red';
      case 'validation':
        return 'yellow';
      default:
        return 'red';
    }
  };

  const colorClasses = {
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-500',
      title: 'text-red-800',
      text: 'text-red-700',
      button: 'bg-red-600 hover:bg-red-700'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'text-orange-500',
      title: 'text-orange-800',
      text: 'text-orange-700',
      button: 'bg-orange-600 hover:bg-orange-700'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-500',
      title: 'text-yellow-800',
      text: 'text-yellow-700',
      button: 'bg-yellow-600 hover:bg-yellow-700'
    }
  };

  const color = getColor();
  const classes = colorClasses[color];

  return (
    <div className={`${classes.bg} border ${classes.border} rounded-lg p-6`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <i className={`${getIcon()} ${classes.icon} text-2xl`}></i>
        </div>
        <div className="ml-4 flex-1">
          <h3 className={`text-lg font-semibold ${classes.title} mb-2`}>
            {error.title}
          </h3>
          <p className={`${classes.text} mb-4`}>
            {error.message}
          </p>

          {/* Validation errors */}
          {error.errors && Object.keys(error.errors).length > 0 && (
            <div className="mb-4">
              <ul className={`list-disc list-inside ${classes.text} text-sm space-y-1`}>
                {Object.entries(error.errors).map(([field, messages]) => (
                  <li key={field}>
                    <span className="font-semibold">{field}:</span>{' '}
                    {Array.isArray(messages) ? messages.join(', ') : messages}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Error details (development mode) */}
          {showDetails && error.statusCode && (
            <details className="mb-4">
              <summary className={`cursor-pointer text-sm ${classes.text} hover:underline`}>
                Technical Details
              </summary>
              <div className="mt-2 text-xs bg-white p-3 rounded border border-gray-200">
                <p><strong>Status Code:</strong> {error.statusCode}</p>
                <p><strong>Error Type:</strong> {error.type}</p>
                {error.retryAfter && (
                  <p><strong>Retry After:</strong> {error.retryAfter} seconds</p>
                )}
              </div>
            </details>
          )}

          {/* Action buttons */}
          <div className="flex space-x-3">
            {error.canRetry && onRetry && (
              <button
                onClick={onRetry}
                className={`${classes.button} text-white px-4 py-2 rounded-lg transition flex items-center`}
              >
                <i className="fas fa-redo mr-2"></i>
                Try Again
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
