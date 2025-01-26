// This file creates a simple table component
import React, { useState, useCallback, useEffect } from 'react';
import { useDebug } from './Debug/DebugContext';
import { useDate } from '../context/DateContext';

function ShiftTable() {
  const { currentDate, getCurrentMonday, getMondayOfWeek, getWeekDates, currentWeek } = useDate();
  const { updateDebugVariables } = useDebug();

  // Track week offset from current week
  const [weekOffset, setWeekOffset] = useState(0);

  // Initialize current week state
  const [currentWeekState, setCurrentWeek] = useState(() => {
    const mondayDate = getCurrentMonday();
    return {
      id: mondayDate,
      startDate: new Date(mondayDate),
      dates: getWeekDates(mondayDate)
    };
  });

  // Navigate to next/previous week
  const navigateWeek = useCallback((direction) => {
    const newOffset = weekOffset + (direction === 'next' ? 1 : -1);
    setWeekOffset(newOffset);
    
    const newMondayDate = getMondayOfWeek(currentDate, newOffset);
    setCurrentWeek({
      id: newMondayDate,
      startDate: new Date(newMondayDate),
      dates: getWeekDates(newMondayDate)
    });
  }, [weekOffset, currentDate, getMondayOfWeek, getWeekDates]);

  // Reset to current week
  const goToCurrentWeek = useCallback(() => {
    setWeekOffset(0);
    const mondayDate = getCurrentMonday();
    setCurrentWeek({
      id: mondayDate,
      startDate: new Date(mondayDate),
      dates: getWeekDates(mondayDate)
    });
  }, [getCurrentMonday, getWeekDates]);

  // Check if a date is today
  const isCurrentDay = useCallback((date) => {
    return date === currentDate;
  }, [currentDate]);

  // Check if a date is in the future
  const isFutureDate = useCallback((date) => {
    return new Date(date) > new Date(currentDate);
  }, [currentDate]);

  const numRows = 2;
  const numColumns = 8;

  // Update debug variables
  useEffect(() => {
    updateDebugVariables({
      ShiftTable: {
        today: {
          value: currentDate,
          lastUpdated: new Date().toLocaleTimeString(),
          type: "date"
        },
        weekOffset: {
          value: weekOffset,
          lastUpdated: new Date().toLocaleTimeString(),
          type: "number"
        },
        currentWeekDates: {
          value: currentWeekState.dates,
          lastUpdated: new Date().toLocaleTimeString(),
          type: "array"
        },
        numRows: {
          value: numRows,
          lastUpdated: new Date().toLocaleTimeString(),
          type: "number"
        },
        numColumns: {
          value: numColumns,
          lastUpdated: new Date().toLocaleTimeString(),
          type: "number"
        }
      }
    });
  }, [numRows, numColumns, updateDebugVariables, currentDate, currentWeekState, weekOffset]);

  return (
    <div className="flex-1 overflow-x-auto">
      {/* Navigation Controls */}
      <div className="flex gap-2 mb-4">
        <button 
          onClick={() => navigateWeek('previous')}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Previous Week
        </button>
        <button 
          onClick={() => navigateWeek('next')}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Next Week
        </button>
        <button 
          onClick={goToCurrentWeek}
          className="px-4 py-2 border rounded hover:bg-gray-100 bg-blue-50"
        >
          Current Week
        </button>
      </div>
      
      {/* Table Container */}
      <div className="mt-4 border rounded-lg shadow-sm bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          {/* First row */}
          <tr>
            <td className="border p-2"></td>
            <td className="border p-2"></td>
            <td className="border p-2"></td>
            <td className="border p-2"></td>
            <td className="border p-2"></td>
            <td className="border p-2"></td>
            <td className="border p-2"></td>
            <td className="border p-2"></td>
          </tr>
          {/* Second row */}
          <tr>
            <td className="border p-2">C1R2</td>
            <td className="border p-2"></td>
            <td className="border p-2"></td>
            <td className="border p-2"></td>
            <td className="border p-2"></td>
            <td className="border p-2"></td>
            <td className="border p-2"></td>
            <td className="border p-2"></td>
          </tr>
        </table>
      </div>
    </div>
  );
}

export default ShiftTable;
