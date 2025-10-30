const ProgressTracker = ({ steps, currentStep }) => {
  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'upcoming';
  };

  return (
    <div className="w-full">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200">
          <div 
            className="h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            
            return (
              <div key={index} className="flex flex-col items-center" style={{ width: `${100 / steps.length}%` }}>
                {/* Step Circle */}
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${status === 'completed' ? 'bg-blue-600 border-blue-600' : ''}
                  ${status === 'current' ? 'bg-white border-blue-600' : ''}
                  ${status === 'upcoming' ? 'bg-white border-gray-300' : ''}
                `}>
                  {status === 'completed' ? (
                    <i className="fas fa-check text-white"></i>
                  ) : (
                    <span className={`
                      text-sm font-semibold
                      ${status === 'current' ? 'text-blue-600' : 'text-gray-400'}
                    `}>
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Step Label */}
                <div className="mt-2 text-center">
                  <p className={`
                    text-sm font-medium
                    ${status === 'completed' || status === 'current' ? 'text-gray-900' : 'text-gray-400'}
                  `}>
                    {step.label}
                  </p>
                  {step.timestamp && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(step.timestamp).toLocaleDateString()}
                    </p>
                  )}
                  {step.note && status === 'current' && (
                    <p className="text-xs text-blue-600 mt-1">
                      {step.note}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Step Details */}
      {steps[currentStep]?.description && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-700">{steps[currentStep].description}</p>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
