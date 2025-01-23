// src/components/DateRangePicker.js
'use client'; // Declare as a Client Component

import React, { useState } from 'react';
import DatePickerInput from './DatePickerInput';

const DateRangePicker = ({ onDateRangeChange }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleStartDateChange = (date) => {
    setStartDate(date);
    if (endDate && date > endDate) {
      setEndDate(null);
    }
    onDateRangeChange({ startDate: date, endDate: null });
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    onDateRangeChange({ startDate, endDate: date });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <DatePickerInput
        label="Start Date"
        selectedDate={startDate}
        onChange={handleStartDateChange}
        maxDate={endDate}
      />
      <DatePickerInput
        label="End Date"
        selectedDate={endDate}
        onChange={handleEndDateChange}
        minDate={startDate}
      />
    </div>
  );
};

export default DateRangePicker;