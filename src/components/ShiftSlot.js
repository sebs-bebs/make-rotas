'use client';
import React, { useEffect, useRef, useState } from 'react';
import Sortable from 'sortablejs';
import TimePicker from 'react-time-picker';

export default function ShiftSlot({
  staffId,
  dayIndex,
  shift,
  onShiftsChange,
  staffShifts,
}) {
  const slotRef = useRef(null);

  // Store user-selected times for the TimePickers
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    // If there's already a shift, e.g. "16:00 - 23:00", parse into start/end
    if (shift && shift.includes('-')) {
      const [start, end] = shift.split('-').map((s) => s.trim());
      setStartTime(start);
      setEndTime(end);
    }
  }, [shift]);

  // Enable drag-and-drop sorting among shifts
  useEffect(() => {
    if (slotRef.current) {
      Sortable.create(slotRef.current, {
        group: `shifts-${staffId}`, // unique ID per staff member
        animation: 150,
        onEnd: (evt) => {
          const oldIndex = evt.oldIndex;
          const newIndex = evt.newIndex;
          if (oldIndex == null || newIndex == null) return;

          const newShifts = [...staffShifts];
          const [removedShift] = newShifts.splice(oldIndex, 1);
          newShifts.splice(newIndex, 0, removedShift);
          onShiftsChange(staffId, newShifts);
        },
      });
    }
  }, [slotRef, staffId, staffShifts, onShiftsChange]);

  // Converts "HH:MM" to a float (e.g. 16.0 for 16:00)
  const parseTime = (timeStr) => {
    const [hours, minutes] = (timeStr || '').split(':').map((x) => parseInt(x, 10));
    if (isNaN(hours) || isNaN(minutes)) return null;
    return hours + minutes / 60;
  };

  // When user clicks "Set Shift"
  const handleAddShift = () => {
    const startVal = parseTime(startTime);
    const endVal = parseTime(endTime);

    if (startVal == null || endVal == null || startVal >= endVal) {
      alert('Please pick valid start and end times (Start < End).');
      return;
    }

    const newShifts = [...staffShifts];
    newShifts[dayIndex] = `${startTime} - ${endTime}`;
    onShiftsChange(staffId, newShifts);
  };

  // Mark this day as "OFF"
  const handleRemoveShift = () => {
    const newShifts = [...staffShifts];
    newShifts[dayIndex] = 'OFF';
    onShiftsChange(staffId, newShifts);
  };

  // Remove "OFF" status so user can reassign a shift
  const handleRemoveOffSlot = () => {
    const newShifts = [...staffShifts];
    newShifts[dayIndex] = ''; // Clear it out
    onShiftsChange(staffId, newShifts);
  };

  return (
    <div ref={slotRef} className="flex flex-col gap-2">
      {/* Row 1: Display the shift text and OFF/Remove button */}
      <div className="flex items-center gap-3">
        {/* Show the current shift as a little "badge" */}
        <span className="px-2 py-1 text-sm rounded bg-gray-200">
          {shift || 'No shift'}
        </span>

        {/* If shift is not OFF (and not empty), show the red "x" to remove it */}
        {shift && shift !== 'OFF' && (
          <button
            onClick={handleRemoveShift}
            className="text-red-500 hover:underline text-sm"
          >
            x
          </button>
        )}

        {/* If the current shift is OFF, show "Remove OFF" button */}
        {shift === 'OFF' && (
          <button
            onClick={handleRemoveOffSlot}
            className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
          >
            Remove OFF
          </button>
        )}
      </div>

      {/* Row 2: Time pickers + "Set Shift" button */}
      <div className="flex items-end gap-3 flex-wrap">
        {/* Start Time */}
        <TimePicker
          onChange={setStartTime}
          value={startTime}
          format="HH:mm"        // 24-hour format; use "hh:mm a" for 12-hour
          disableClock={true}   // hide the analog clock face
          clearIcon={null}
          className="border border-gray-300 rounded p-1 w-24 text-sm"
          clockClassName=""
          // You can add more style or className props if needed
        />

        {/* End Time */}
        <TimePicker
          onChange={setEndTime}
          value={endTime}
          format="HH:mm"
          disableClock={true}
          clearIcon={null}
          className="border border-gray-300 rounded p-1 w-24 text-sm"
        />

        {/* "Set Shift" Button */}
        <button
          onClick={handleAddShift}
          className="bg-indigo-500 text-white py-1 px-3 rounded text-sm
                     hover:bg-indigo-600 transition"
        >
          Set Shift
        </button>
      </div>
    </div>
  );
}
