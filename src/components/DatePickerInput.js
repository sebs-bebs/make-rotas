// src/components/DatePickerInput.js
'use client';
import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './DatePickerInput.css'; // Import the CSS for the DatePickerInput
import { format } from 'date-fns';

const DatePickerInput = ({ label, selectedDate, onChange, minDate, maxDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const datePickerRef = useRef(null);

  // Close the date picker when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="flex flex-col mb-4 relative">
      <label className="text-lg font-semibold mb-2">{label}</label>
      <div className="relative">
        <input
          type="text"
          className="border rounded-md p-2 w-full cursor-pointer"
          value={selectedDate ? format(selectedDate, 'MMM dd, yyyy') : ''}
          onClick={() => setIsOpen(!isOpen)}
          readOnly
          placeholder={label}
        />
        {isOpen && (
          <div
            ref={datePickerRef}
            className="datepicker-popup"
            // Inline styles for demonstration; ideally, use CSS classes
            style={{
              position: 'absolute',
              top: '110%', // Position below the input
              left: 0,
              zIndex: 1000, // Ensure it appears above other elements
            }}
          >
            <DatePicker
              selected={selectedDate}
              onChange={onChange}
              dateFormat="MMM d, yyyy" // Update date format here
              minDate={minDate}
              maxDate={maxDate}
              inline
              // You can customize additional DatePicker props here
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DatePickerInput;