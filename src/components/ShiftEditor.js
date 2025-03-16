import React, { useState, useEffect, useMemo } from 'react';
import { useDebug } from './Debug/DebugContext';

function ShiftEditor({ staffName, day, startTime: initialStartTime, endTime: initialEndTime, weekStartDate, onSave, onCancel }) {
  const { updateDebugVariables } = useDebug();
  const [startTime, setStartTime] = useState(initialStartTime || '');
  const [endTime, setEndTime] = useState(initialEndTime || '');
  
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
    
    // Convert time strings to comparable values for proper sorting
    const convertTimeToMinutes = (timeStr) => {
      if (!timeStr) return 0;
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const startTimeMinutes = convertTimeToMinutes(startTime);
    
    // Filter times that are after the start time
    const filtered = timeOptions.filter(time => {
      const timeMinutes = convertTimeToMinutes(time);
      return timeMinutes > startTimeMinutes;
    });
    
    return filtered;
  }, [timeOptions, startTime]);
  
  // Debug logging for time selection
  useEffect(() => {
    console.log('ShiftEditor time selection:', {
      startTime,
      endTime,
      validEndTimeOptions: validEndTimeOptions.length
    });
  }, [startTime, endTime, validEndTimeOptions.length]);
  
  // Update debug variables when component renders
  useEffect(() => {
    updateDebugVariables('ShiftEditor', {
      isActive: true,
      staffName,
      day,
      startTime,
      endTime,
      weekStartDate,
      validEndTimeOptions: validEndTimeOptions.length
    });
    
    return () => {
      updateDebugVariables('ShiftEditor', {
        isActive: false
      });
    };
  }, [updateDebugVariables, staffName, day, startTime, endTime, weekStartDate, validEndTimeOptions.length]);

  // Handle start time change
  const handleStartTimeChange = (e) => {
    const newStartTime = e.target.value;
    console.log(`DEBUG: ShiftEditor.handleStartTimeChange called with value: "${newStartTime}"`);
    
    // First set the local state
    setStartTime(newStartTime);
    
    // Reset endTime if it becomes invalid
    if (endTime && newStartTime >= endTime) {
      console.log(`DEBUG: ShiftEditor resetting endTime because "${endTime}" is <= new startTime: "${newStartTime}"`);
      setEndTime('');
    }
  };

  // Handle end time change
  const handleEndTimeChange = (e) => {
    const newEndTime = e.target.value;
    console.log(`DEBUG: ShiftEditor.handleEndTimeChange called with value: "${newEndTime}"`);
    
    // Set the local state
    setEndTime(newEndTime);
  };

  const handleSaveClick = () => {
    // Call the parent's onSave function with all the required parameters
    onSave(staffName, day, startTime, endTime, weekStartDate);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded shadow-lg max-w-md w-full">
        <h3 className="text-lg font-medium mb-4">Edit Shift for {staffName} on {day}</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm">Start Time</label>
            <select 
              value={startTime} 
              onChange={handleStartTimeChange}
              className="w-full border rounded p-2"
            >
              <option value="">Select Start Time</option>
              {timeOptions.map(time => (
                <option key={`start-${time}`} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm">End Time</label>
            <select 
              value={endTime} 
              onChange={handleEndTimeChange}
              className="w-full border rounded p-2"
              disabled={!startTime}
              data-testid={`editor-end-time-select`}
            >
              <option value="">Select End Time</option>
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
        </div>
        
        <div className="mt-6 flex justify-end space-x-2">
          <button 
            onClick={onCancel}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button 
            onClick={handleSaveClick}
            className="px-4 py-2 border rounded bg-blue-500 text-white"
            disabled={!startTime || !endTime}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShiftEditor;
