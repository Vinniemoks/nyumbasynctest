const StatusBadge = ({ status, size = 'md', customLabel = null, showIcon = true }) => {
  const statusConfig = {
    pending: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-300',
      icon: 'fa-clock',
      label: 'Pending'
    },
    approved: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-300',
      icon: 'fa-check-circle',
      label: 'Approved'
    },
    rejected: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-300',
      icon: 'fa-times-circle',
      label: 'Rejected'
    },
    'inspection_scheduled': {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-300',
      icon: 'fa-calendar-check',
      label: 'Inspection Scheduled'
    },
    completed: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-300',
      icon: 'fa-check-double',
      label: 'Completed'
    },
    cancelled: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-300',
      icon: 'fa-ban',
      label: 'Cancelled'
    },
    paid: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-300',
      icon: 'fa-check-circle',
      label: 'Paid'
    },
    overdue: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-300',
      icon: 'fa-exclamation-circle',
      label: 'Overdue'
    },
    due: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-300',
      icon: 'fa-exclamation-triangle',
      label: 'Due'
    },
    active: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-300',
      icon: 'fa-circle',
      label: 'Active'
    },
    inactive: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-300',
      icon: 'fa-circle',
      label: 'Inactive'
    },
    submitted: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-300',
      icon: 'fa-paper-plane',
      label: 'Submitted'
    },
    in_progress: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      border: 'border-purple-300',
      icon: 'fa-spinner',
      label: 'In Progress'
    },
    inspection: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-300',
      icon: 'fa-search',
      label: 'Inspection'
    }
  };

  const config = statusConfig[status] || statusConfig.pending;
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={`inline-flex items-center gap-2 ${sizeClasses[size]} ${config.bg} ${config.text} ${config.border} border rounded-full font-medium`}>
      {showIcon && <i className={`fas ${config.icon}`}></i>}
      <span>{customLabel || config.label}</span>
    </span>
  );
};

export default StatusBadge;
