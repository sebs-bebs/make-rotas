import React from 'react';
import { WEEKDAYS } from '../constants';

/**
 * Simple component to show and toggle availability for each day
 * @param {Object} props
 * @param {string[]} props.selectedDays - Array of selected day codes (e.g., ['M', 'W', 'F'])
 * @param {function} props.onChange - Called when selection changes
 * @param {boolean} props.disabled - If true, buttons can't be clicked
 */
const Availability = ({ selectedDays = [], onChange, disabled = false }) => {
  const handleDayClick = (day) => {
    if (disabled) return;

    // If day is selected, remove it; otherwise add it
    const newSelection = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];

    onChange(newSelection);
  };

  return (
    <div className="flex gap-1">
      {WEEKDAYS.map((day) => (
        <button
          key={day}
          onClick={() => handleDayClick(day)}
          disabled={disabled}
          className={`
            w-8 h-8 rounded
            ${selectedDays.includes(day)
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700'}
            ${disabled
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-blue-100'}
          `}
          aria-label={`Toggle ${day} availability`}
          type="button"
        >
          {day}
        </button>
      ))}
    </div>
  );
};

export default Availability;
