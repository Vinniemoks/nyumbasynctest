const StatCard = ({ title, value, subtitle, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500'
  };

  return (
    <article 
      className="bg-white rounded-lg shadow p-6" 
      role="listitem"
      aria-label={`${title}: ${value}${subtitle ? `, ${subtitle}` : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2" aria-label={`Value: ${value}`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className={`${colorClasses[color]} p-4 rounded-full`} aria-hidden="true">
            <i className={`${icon} text-white text-2xl`}></i>
          </div>
        )}
      </div>
    </article>
  );
};

export default StatCard;
