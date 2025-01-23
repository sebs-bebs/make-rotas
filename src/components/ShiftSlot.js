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
    const [isShiftAdded, setIsShiftAdded] = useState(shift !== 'OFF');

    // Update local state when shift prop changes
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

    const handleStartTimeChange = (event) => {
        const newStartTime = event.target.value;
        setStartTime(newStartTime);
        if (newStartTime && endTime) {
            updateShiftIfValid(newStartTime, endTime);
        }
    };

    const handleEndTimeChange = (event) => {
        const newEndTime = event.target.value;
        setEndTime(newEndTime);
        if (startTime && newEndTime) {
            updateShiftIfValid(startTime, newEndTime);
        }
    };

    const parseTime = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map((x) => parseInt(x, 10));
        if (isNaN(hours) || isNaN(minutes)) return null;
        return hours + minutes / 60;
    };

    const updateShiftIfValid = (start, end) => {
        if (!start || !end) return;

        const startVal = parseTime(start);
        const endVal = parseTime(end);

        if (startVal >= endVal) {
            alert('End time must be after start time.');
            return;
        }

        const updateFn = (prevShifts) => {
            if (!Array.isArray(prevShifts)) {
                prevShifts = Array(7).fill('OFF');
            }
            const newShifts = [...prevShifts];
            newShifts[dayIndex] = `${start} - ${end}`;
            return newShifts;
        };

        onShiftsChange(weekId, staffId, dayIndex, updateFn);
        setIsShiftAdded(true);
    };

    const handleRemoveShift = () => {
        const updateFn = (prevShifts) => {
            if (!Array.isArray(prevShifts)) {
                prevShifts = Array(7).fill('OFF');
            }
            const newShifts = [...prevShifts];
            newShifts[dayIndex] = 'OFF';
            return newShifts;
        };
        onShiftsChange(weekId, staffId, dayIndex, updateFn);
        setIsShiftAdded(false);
        setStartTime('');
        setEndTime('');
    };

    return (
        <div className="flex flex-col gap-2 w-full">
            {/* Shift Display */}
            {isShiftAdded ? (
                <div className="flex items-center gap-1 bg-gray-200 rounded px-2 py-1 text-sm w-fit shift-slot-chip">
                    <span>{`${startTime} - ${endTime}`}</span>
                    <button
                        onClick={handleRemoveShift}
                        className="text-red-500 ml-1 hover:text-red-700"
                    >
                        ×
                    </button>
                </div>
            ) : (
                <div className="flex gap-2">
                    <select
                        value={startTime}
                        onChange={handleStartTimeChange}
                        className="p-1 text-sm border rounded"
                    >
                        <option value="">Start</option>
                        {timeOptions.map((time) => (
                            <option key={time} value={time}>
                                {time}
                            </option>
                        ))}
                    </select>
                    <select
                        value={endTime}
                        onChange={handleEndTimeChange}
                        className="p-1 text-sm border rounded"
                    >
                        <option value="">End</option>
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