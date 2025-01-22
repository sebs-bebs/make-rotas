// src/components/ShiftSlot.js
'use client';
import React, { useState, useEffect } from 'react';
import { generateTimeOptions } from '../utils/generateTimeOptions';

export default function ShiftSlot({
    staffId,
    dayIndex,
    shift,
    onShiftsChange,
    staffShifts,
}) {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const timeOptions = generateTimeOptions();
    const [isShiftAdded, setIsShiftAdded] = useState(false);

    useEffect(() => {
        // When the shift prop changes, update the component's state
        if (shift && shift !== 'OFF') {
            const [start, end] = shift.split('-').map((s) => s.trim());
            setStartTime(start);
            setEndTime(end);
            setIsShiftAdded(true);
        } else {
            setStartTime('');
            setEndTime('');
            setIsShiftAdded(false);
        }
    }, [shift]);

   useEffect(() => {
      const handleAutoAssignShift = () => {
        if (startTime && endTime) {
            const startVal = parseTime(startTime);
            const endVal = parseTime(endTime);
  
            if (startVal >= endVal) {
              alert('End time must be after start time.');
              return;
            }
  
            // Call onShiftsChange with a function to access the latest state
            onShiftsChange(staffId, (prevShifts) => {
              const newShifts = [...prevShifts];
              newShifts[dayIndex] = `${startTime} - ${endTime}`;
              return newShifts;
          });
  
           setIsShiftAdded(true);
        }
      };
      handleAutoAssignShift();
     }, [
       startTime,
       endTime,
       staffId,
       dayIndex,
       onShiftsChange,
     ]);
     
    // Update the start time state and enable the shift creation
     const handleStartTimeChange = (event) => {
        setStartTime(event.target.value);
     };

    // Update the end time state and enable the shift creation
     const handleEndTimeChange = (event) => {
       setEndTime(event.target.value);
     };
        
    const handleRemoveShift = () => {
      onShiftsChange(staffId, (prevShifts) => {
          const newShifts = [...prevShifts];
          newShifts[dayIndex] = 'OFF'; // Resets the shift to OFF
          return newShifts;
        });
        setIsShiftAdded(false);
    };

    // Helper function to parse the time format
    const parseTime = (timeStr) => {
       const [hours, minutes] = timeStr.split(':').map(Number);
       return hours + minutes / 60;
      };
  
    return (
        <div className="flex flex-col gap-2">
            {/* Shift Display */}
            {isShiftAdded && (
                <div className="flex items-center gap-1 bg-gray-200 rounded px-2 py-1 text-sm w-fit"> {/* Adjusted padding to px-2  */}
                    <span>{shift}</span>
                    <button
                        onClick={handleRemoveShift}
                        className="text-red-500 ml-1 hover:underline"
                    >
                        x
                    </button>
                </div>
            )}

           {/* Shift Selection */}
           {!isShiftAdded && (
              <div className="flex items-end gap-3">
                 <select
                    value={startTime}
                    onChange={handleStartTimeChange}
                    className="border border-gray-300 rounded p-1 w-24 text-sm"
                 >
                  <option value="">Start Time</option>
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                         {time}
                      </option>
                   ))}
                 </select>
                 
                 <select
                    value={endTime}
                    onChange={handleEndTimeChange}
                    className="border border-gray-300 rounded p-1 w-24 text-sm"
                 >
                   <option value="">End Time</option>
                     {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                     </option>
                   ))}
                 </select>
               </div>
           )}
       </div>
    );
}