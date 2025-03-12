import React, { useState, useEffect } from 'react';
import { useDebug } from './Debug/DebugContext';

function ShiftSlot({ staffName, day, rowId, colIndex, onShiftChange }) {
  const { updateDebugVariables } = useDebug();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [weekStartDate, setWeekStartDate] = useState('');
  
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
  
  // Handle start time change
  const handleStartTimeChange = (e) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);
    
    // If end time is now invalid (earlier than start time), clear it
    if (endTime && endTime <= newStartTime) {
      setEndTime('');
    }
    
    // Update parent component only
    if (onShiftChange) {
      onShiftChange(staffName, day, newStartTime, endTime);
    }
  };
  
  // Handle end time change
  const handleEndTimeChange = (e) => {
    const newEndTime = e.target.value;
    setEndTime(newEndTime);
    
    // Update parent component only
    if (onShiftChange) {
      onShiftChange(staffName, day, startTime, newEndTime);
    }
  };
  
  // Load saved shift data when component mounts or when staff/day changes
  useEffect(() => {
    // Get all shift data from localStorage
    const savedShiftData = JSON.parse(localStorage.getItem('shiftData') || '{}');
    
    // Get the current week's Monday date - we need to check the header cells to find this
    // First get all rows from localStorage
    const savedRows = JSON.parse(localStorage.getItem('shiftTableRows') || '[]');
    
    // Find the header row (first row)
    const headerRow = savedRows.find(row => row.id === 'row-1');
    
    if (headerRow && headerRow.cells && headerRow.cells.length > 1) {
      // Parse the Monday cell which has format "Monday\n2025-03-10"
      const mondayCell = headerRow.cells[1];
      if (mondayCell) {
        const datePart = mondayCell.split('\n')[1];
        if (datePart) {
          setWeekStartDate(datePart);
          
          // Now try to find the shift with the week-specific key first
          const weekSpecificKey = `${staffName}_${day}_${datePart}`;
          const weekSpecificShift = savedShiftData[weekSpecificKey];
          
          if (weekSpecificShift && weekSpecificShift.startTime && weekSpecificShift.endTime) {
            setStartTime(weekSpecificShift.startTime);
            setEndTime(weekSpecificShift.endTime);
            return;
          }
        }
      }
    }
    
    // If we couldn't find week-specific data, try the legacy format
    const legacyKey = `${staffName}_${day}`;
    const legacyShift = savedShiftData[legacyKey];
    
    if (legacyShift && legacyShift.startTime && legacyShift.endTime) {
      setStartTime(legacyShift.startTime);
      setEndTime(legacyShift.endTime);
    }
  }, [staffName, day]);
  
  return (
    <div className="flex flex-col space-y-1">
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
      
      {startTime && endTime && (
        <div className="text-xs text-center">
          {calculateDuration()}
        </div>
      )}
    </div>
  );
}

export default ShiftSlot;
