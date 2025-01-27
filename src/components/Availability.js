import React from 'react';
import { WEEKDAYS } from '../constants';
import PropTypes from 'prop-types';

/**
 * Component to show and toggle availability for each day of the week
 * @param {Object} props
 * @param {Array<string>} props.value - Array of selected day codes (e.g., ['M', 'W', 'F'])
 * @param {function} props.onChange - Called when selection changes with new array of days
 * @param {boolean} props.disabled - If true, buttons can't be clicked
 */
const Availability = ({ value = [], onChange, disabled = false }) => {
  const handleDayClick = (day) => {
    if (disabled) return;

    // If day is selected, remove it; otherwise add it
    const newSelection = value.includes(day)
      ? value.filter(d => d !== day)
      : [...value, day].sort((a, b) => WEEKDAYS.indexOf(a) - WEEKDAYS.indexOf(b));

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
            ${value.includes(day)
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

Availability.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

export default Availability;
