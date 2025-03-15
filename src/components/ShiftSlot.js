import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDebug } from './Debug/DebugContext';

function ShiftSlot({ staffName, day, rowId, colIndex, onShiftChange, shiftData = {}, weekStartDate = '' }) {
  const { updateDebugVariables } = useDebug();
  
  // Initialize state from props
  const [startTime, setStartTime] = useState(shiftData?.startTime || '');
  const [endTime, setEndTime] = useState(shiftData?.endTime || '');
  
  // Debug when component renders
  console.log(`ShiftSlot (${staffName}-${day}) render:`, {
    key: `${staffName}-${day}-${weekStartDate}`,
    hasShiftData: !!shiftData,
    startTimeFromProps: shiftData?.startTime || '', 
    endTimeFromProps: shiftData?.endTime || '',
    startTimeInState: startTime,
    endTimeInState: endTime
  });
  
  // Log what we received
  console.log(`ShiftSlot (${staffName}-${day}) received:`, {
    startTime: shiftData?.startTime || '', 
    endTime: shiftData?.endTime || '',
    hasData: Object.keys(shiftData || {}).length > 0
  });
  
  // Generate time options in 15-minute increments
  const timeOptions = useMemo(() => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        options.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return options;
  }, []);
  
  // Filter end time options to only show times after start time
  const validEndTimeOptions = useMemo(() => {
    if (!startTime) return [];
    return timeOptions.filter(time => time > startTime);
  }, [timeOptions, startTime]);
  
  // Debug time options calculation
  useEffect(() => {
    updateDebugVariables({
      [`${staffName}_${day}_timeOptionsCount`]: timeOptions.length,
      [`${staffName}_${day}_validEndTimeOptionsCount`]: validEndTimeOptions.length,
      [`${staffName}_${day}_startTime`]: startTime,
      [`${staffName}_${day}_endTime`]: endTime,
    });
  }, [updateDebugVariables, staffName, day, timeOptions.length, validEndTimeOptions.length, startTime, endTime]);

  // Debug logging for time options
  useEffect(() => {
    if (startTime) {
      console.log(`ShiftSlot (${staffName}-${day}) validEndTimeOptions:`, {
        startTime,
        endTime,
        optionsCount: validEndTimeOptions.length,
        hasOptions: validEndTimeOptions.length > 0
      });
    }
  }, [startTime, endTime, validEndTimeOptions.length, staffName, day]);
  
  // Calculate shift duration in hours
  const calculateDuration = useCallback(() => {
    if (!startTime || !endTime) return '';
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    
    const durationMinutes = endTotalMinutes - startTotalMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    return `(${hours}${minutes > 0 ? `:${minutes.toString().padStart(2, '0')}` : ''} ${hours === 1 ? 'hour' : 'hours'})`;
  }, [startTime, endTime]);
  
  // Update state when shiftData props change
  useEffect(() => {
    // Always log what we receive for debugging
    console.log(`ShiftSlot (${staffName}-${day}) received props:`, {
      hasShiftData: !!shiftData,
      shiftData,
      weekStartDate
    });
    
    // Always reset times when receiving new props
    // This is critical for properly showing/hiding shifts when navigating weeks
    if (shiftData && (shiftData.startTime || shiftData.endTime)) {
      // We have actual shift data - show it
      setStartTime(shiftData.startTime || '');
      setEndTime(shiftData.endTime || '');
      
      console.log(`ShiftSlot (${staffName}-${day}) set times from props:`, {
        startTime: shiftData.startTime || '',
        endTime: shiftData.endTime || ''
      });
    } else {
      // No shift data for this cell - clear the times
      setStartTime('');
      setEndTime('');
      
      console.log(`ShiftSlot (${staffName}-${day}) cleared times (no data)`);
    }
  }, [shiftData, staffName, day, weekStartDate]);
  
  // Handle changes to the startTime - FIXED
  const handleStartTimeChange = (e) => {
    const newStartTime = e.target.value;
    console.log(`DEBUG: handleStartTimeChange called with value: "${newStartTime}"`);
    console.log(`DEBUG: Before update - Current startTime: "${startTime}", endTime: "${endTime}"`);
    
    // First set the local state
    setStartTime(newStartTime);
    
    // Then notify the parent AFTER updating local state
    // Reset endTime if it's now invalid
    if (endTime && newStartTime >= endTime) {
      console.log(`DEBUG: Resetting endTime because current endTime: "${endTime}" is <= new startTime: "${newStartTime}"`);
      setEndTime('');
      // Use a small timeout to ensure state updates have been processed
      setTimeout(() => {
        onShiftChange(staffName, day, newStartTime, '', weekStartDate);
      }, 0);
    } else {
      // Use a small timeout to ensure state updates have been processed
      setTimeout(() => {
        onShiftChange(staffName, day, newStartTime, endTime, weekStartDate);
      }, 0);
    }
  };
  
  // Handle changes to the endTime - FIXED
  const handleEndTimeChange = (e) => {
    const newEndTime = e.target.value;
    console.log(`DEBUG: handleEndTimeChange called with value: "${newEndTime}"`);
    console.log(`DEBUG: Before update - Current startTime: "${startTime}", endTime: "${endTime}"`);
    
    // First set the local state
    setEndTime(newEndTime);
    
    // Then notify the parent AFTER updating local state
    // Use a small timeout to ensure state updates have been processed
    setTimeout(() => {
      onShiftChange(staffName, day, startTime, newEndTime, weekStartDate);
    }, 0);
  };
  
  // Add debugging to track state
  useEffect(() => {
    // Calculate the duration in the background
    const duration = (startTime && endTime) ? calculateDuration() : '';
    
    updateDebugVariables({
      [`shiftSlot-${staffName}-${day}-${weekStartDate}`]: {
        hasShiftData: !!shiftData,
        startTime,
        endTime,
        weekStartDate,
        duration, // Add duration to debug variables
        lastUpdated: new Date().toISOString()
      }
    });
  }, [updateDebugVariables, shiftData, startTime, endTime, staffName, day, weekStartDate, calculateDuration]);
  
  // Return the component UI
  return (
    <div data-testid={`shift-slot-${staffName}-${day}-${weekStartDate}`}>
      {/* Show the time chip if both times are selected, otherwise show the dropdowns */}
      {startTime && endTime ? (
        // Simple chip showing time range
        <div className="text-xs border rounded p-1 text-center relative">
          <span>{startTime} - {endTime}</span>
          <button 
            className="absolute right-1 top-1 text-gray-500 hover:text-gray-700" 
            onClick={() => {
              // Reset times to allow re-selection
              setStartTime('');
              setEndTime('');
              onShiftChange(staffName, day, '', '', weekStartDate);
            }}
            aria-label="Clear time selection"
          >
            ×
          </button>
        </div>
      ) : (
        // Show dropdowns when times are not yet selected
        <div className="flex space-x-1 items-center">
          <select 
            value={startTime} 
            onChange={handleStartTimeChange}
            className="text-xs border rounded p-1 w-20"
          >
            <option value="">Start</option>
            {timeOptions.map(time => (
              <option key={`start-${time}`} value={time}>
                {time}
              </option>
            ))}
          </select>
          
          <span className="text-xs">-</span>
          
          <select 
            value={endTime} 
            onChange={handleEndTimeChange}
            className="text-xs border rounded p-1 w-20"
            disabled={!startTime}
            data-testid={`end-time-select-${staffName}-${day}`}
          >
            <option value="">End</option>
            {validEndTimeOptions.length > 0 ? (
              validEndTimeOptions.map(time => (
                <option key={`end-${time}`} value={time}>
                  {time}
                </option>
              ))
            ) : (
              startTime ? (
                <option value="">No valid end times</option>
              ) : null
            )}
          </select>
        </div>
      )}
    </div>
  );
}

export default ShiftSlot;
