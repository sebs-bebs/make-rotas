// src/components/ShiftSlot.js
import React, { useState, useEffect } from 'react';
import { generateTimeOptions } from '../utils/generateTimeOptions';

export default function ShiftSlot({
    staffId,
    dayIndex,
    shift,
    onShiftsChange,
    staffShifts,
    weekId,
}) {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const timeOptions = generateTimeOptions();
    const [isShiftAdded, setIsShiftAdded] = useState(false);

    useEffect(() => {
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

                const updateFn = (prevShifts) => {
                    const newShifts = [...prevShifts];
                    newShifts[dayIndex] = `${startTime} - ${endTime}`;
                    return newShifts;
                };
                 onShiftsChange(weekId, staffId, dayIndex, updateFn);

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
       weekId,
    ]);

    const handleStartTimeChange = (event) => {
        setStartTime(event.target.value);
    };

    const handleEndTimeChange = (event) => {
        setEndTime(event.target.value);
    };

     const handleRemoveShift = () => {
       const updateFn = (prevShifts) => {
            const newShifts = [...prevShifts];
            newShifts[dayIndex] = 'OFF';
            return newShifts;
        };
       onShiftsChange(weekId, staffId, dayIndex, updateFn);

        setIsShiftAdded(false);
    };

    const parseTime = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map((x) => parseInt(x, 10));
        if (isNaN(hours) || isNaN(minutes)) return null;
        return hours + minutes / 60;
    };

    return (
        <div className="flex flex-col gap-2 w-full">
             {/* Shift Display */}
             {isShiftAdded && (
                <div className="flex items-center gap-1 bg-gray-200 rounded px-2 py-1 text-sm w-fit shift-slot-chip">
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