import { useState, useRef, useEffect } from 'react';

const DatePicker = ({ 
  value, 
  onChange, 
  label, 
  placeholder = 'Select date',
  minDate = null,
  maxDate = null,
  disabled = false,
  error = null,
  required = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const isDateDisabled = (date) => {
    if (minDate && date < new Date(minDate)) return true;
    if (maxDate && date > new Date(maxDate)) return true;
    return false;
  };

  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const isToday = (date) => {
    return isSameDay(date, new Date());
  };

  const handleDateSelect = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    if (isDateDisabled(newDate)) return;

    setSelectedDate(newDate);
    if (onChange) {
      onChange(newDate);
    }
    setIsOpen(false);
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
    if (onChange) {
      onChange(today);
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedDate(null);
    if (onChange) {
      onChange(null);
    }
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isSelected = isSameDay(date, selectedDate);
      const isCurrentDay = isToday(date);
      const isDisabled = isDateDisabled(date);

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateSelect(day)}
          disabled={isDisabled}
          className={`
            p-2 text-sm rounded-lg transition-colors
            ${isSelected ? 'bg-blue-600 text-white font-semibold' : ''}
            ${isCurrentDay && !isSelected ? 'bg-blue-100 text-blue-600 font-semibold' : ''}
            ${!isSelected && !isCurrentDay ? 'hover:bg-gray-100' : ''}
            ${isDisabled ? 'text-gray-300 cursor-not-allowed hover:bg-transparent' : ''}
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label htmlFor="date-picker-input" className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}

      {/* Input Field */}
      <div className="relative">
        <input
          id="date-picker-input"
          type="text"
          value={formatDate(selectedDate)}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
            w-full px-4 py-2 pr-10 border rounded-lg cursor-pointer
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'}
            focus:outline-none focus:ring-2 focus:ring-blue-500
          `}
          aria-label={label || 'Select date'}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? 'date-picker-error' : undefined}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          role="combobox"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2" aria-hidden="true">
          {selectedDate && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Clear selected date"
              tabIndex={-1}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
          <i className="fas fa-calendar text-gray-400"></i>
        </div>
      </div>

      {error && (
        <p id="date-picker-error" className="mt-1 text-sm text-red-500" role="alert">{error}</p>
      )}

      {/* Calendar Dropdown */}
      {isOpen && !disabled && (
        <div 
          className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80"
          role="dialog"
          aria-label="Calendar date picker"
          aria-modal="false"
        >
          {/* Month/Year Navigation */}
          <div className="flex items-center justify-between mb-4" role="group" aria-label="Month navigation">
            <button
              type="button"
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Previous month"
            >
              <i className="fas fa-chevron-left text-gray-600" aria-hidden="true"></i>
            </button>
            <div className="text-center">
              <h2 className="font-semibold text-gray-900" id="calendar-month-year">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Next month"
            >
              <i className="fas fa-chevron-right text-gray-600" aria-hidden="true"></i>
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2" role="row">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
              <div key={day} className="text-center text-xs font-semibold text-gray-600 p-2" role="columnheader">
                <abbr title={day} aria-label={day}>{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][index]}</abbr>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1" role="grid" aria-labelledby="calendar-month-year">
            {renderCalendar()}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleToday}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              aria-label="Select today's date"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              aria-label="Close calendar"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
