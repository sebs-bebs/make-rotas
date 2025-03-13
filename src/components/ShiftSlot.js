import React, { useState, useEffect } from 'react';
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
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      timeOptions.push(`${formattedHour}:${formattedMinute}`);
    }
  }
  
  // Filter end time options to only show times after start time
  const validEndTimeOptions = startTime 
    ? timeOptions.filter(time => time > startTime) 
    : timeOptions;
    
  // Calculate shift duration in hours
  const calculateDuration = () => {
    if (!startTime || !endTime) return '';
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    
    const durationMinutes = endTotalMinutes - startTotalMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    return `(${hours}${minutes > 0 ? `:${minutes.toString().padStart(2, '0')}` : ''} ${hours === 1 ? 'hour' : 'hours'})`;
  };
  
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
  
  // Handle changes to the startTime
  const handleStartTimeChange = (e) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);
    console.log(`ShiftSlot (${staffName}-${day}) start time changed:`, newStartTime);
    
    // Notify the parent component of the change
    onShiftChange(staffName, day, newStartTime, endTime);
  };
  
  // Handle changes to the endTime
  const handleEndTimeChange = (e) => {
    const newEndTime = e.target.value;
    setEndTime(newEndTime);
    console.log(`ShiftSlot (${staffName}-${day}) end time changed:`, newEndTime);
    
    // Notify the parent component of the change
    onShiftChange(staffName, day, startTime, newEndTime);
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
        <div 
          className="text-xs border rounded p-1 text-center cursor-pointer"
          onClick={() => {
            // Reset times to allow re-selection
            setStartTime('');
            setEndTime('');
            onShiftChange(staffName, day, '', '');
          }}
        >
          {startTime} - {endTime}
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
          >
            <option value="">End</option>
            {validEndTimeOptions.map(time => (
              <option key={`end-${time}`} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

export default ShiftSlot;
