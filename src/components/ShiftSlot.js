'use client';
import React, { useEffect, useRef, useState } from 'react';
import TimePicker from 'react-time-picker';

export default function ShiftSlot({
  staffId,       // ID of the staff member
  dayIndex,      // Index of the day (e.g., 0 for Monday)
  shift,         // Current shift value (e.g., "09:00 - 17:00")
  onShiftsChange, // Function to update shifts for the staff
  staffShifts,   // Array of all shifts for the staff member
}) {
  const [startTime, setStartTime] = useState(''); // Start time state
  const [endTime, setEndTime] = useState('');     // End time state

  // Pre-fill the time pickers if a shift already exists
  useEffect(() => {
    if (shift && shift.includes('-')) {
      const [start, end] = shift.split('-').map((s) => s.trim());
      setStartTime(start);
      setEndTime(end);
    }
  }, [shift]);

  // Helper function: Convert "HH:MM" to a float for calculations
  const parseTime = (timeStr) => {
    const [hours, minutes] = (timeStr || '').split(':').map((x) => parseInt(x, 10));
    if (isNaN(hours) || isNaN(minutes)) return null;
    return hours + minutes / 60;
  };

  // Function to handle adding a shift
  const handleAddShift = () => {
    const startVal = parseTime(startTime);
    const endVal = parseTime(endTime);

    // Ensure valid times are entered
    if (startVal == null || endVal == null || startVal >= endVal) {
      alert('Please pick valid start and end times (Start < End).');
      return;
    }

    // Check for existing shifts on the same day
    const existingShift = staffShifts[dayIndex];
    if (existingShift && existingShift !== 'OFF') {
      alert('A shift is already assigned for this day. Remove the existing shift to assign a new one.');
      return;
    }

    // Assign the new shift
    const newShifts = [...staffShifts];
    newShifts[dayIndex] = `${startTime} - ${endTime}`;
    onShiftsChange(staffId, newShifts);
  };

  // Function to handle removing a shift (mark as "OFF")
  const handleRemoveShift = () => {
    const newShifts = [...staffShifts];
    newShifts[dayIndex] = 'OFF';
    onShiftsChange(staffId, newShifts);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Display the current shift and a button to remove it */}
      <div className="flex items-center gap-3">
        <span className="px-2 py-1 text-sm rounded bg-gray-200">
          {shift || 'No shift'}
        </span>
        {shift && shift !== 'OFF' && (
          <button
            onClick={handleRemoveShift}
            className="text-red-500 hover:underline text-sm"
          >
            Remove Shift
          </button>
        )}
      </div>

      {/* Input for selecting start and end times */}
      <div className="flex items-end gap-3">
        <TimePicker
          onChange={setStartTime}
          value={startTime}
          format="HH:mm" // Use 24-hour format
          disableClock={true}
          className="border border-gray-300 rounded p-1 w-24 text-sm"
        />
        <TimePicker
          onChange={setEndTime}
          value={endTime}
          format="HH:mm" // Use 24-hour format
          disableClock={true}
          className="border border-gray-300 rounded p-1 w-24 text-sm"
        />
        <button
          onClick={handleAddShift}
          className="bg-indigo-500 text-white py-1 px-3 rounded text-sm hover:bg-indigo-600 transition"
        >
          Set Shift
        </button>
      </div>
    </div>
  );
}
