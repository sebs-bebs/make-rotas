// This file creates a simple table component
import React, { useState, useCallback, useEffect, useMemo } from 'react';
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

  // Create variables for each day of the week with date and week information
  const weekDays = useMemo(() => {
    const [mon, tue, wed, thu, fri, sat, sun] = currentWeekState.dates;
    return {
      monday: {
        date: mon,
        week: weekOffset,
        isCurrentWeek: weekOffset === 0,
        dayName: 'Monday'
      },
      tuesday: {
        date: tue,
        week: weekOffset,
        isCurrentWeek: weekOffset === 0,
        dayName: 'Tuesday'
      },
      wednesday: {
        date: wed,
        week: weekOffset,
        isCurrentWeek: weekOffset === 0,
        dayName: 'Wednesday'
      },
      thursday: {
        date: thu,
        week: weekOffset,
        isCurrentWeek: weekOffset === 0,
        dayName: 'Thursday'
      },
      friday: {
        date: fri,
        week: weekOffset,
        isCurrentWeek: weekOffset === 0,
        dayName: 'Friday'
      },
      saturday: {
        date: sat,
        week: weekOffset,
        isCurrentWeek: weekOffset === 0,
        dayName: 'Saturday'
      },
      sunday: {
        date: sun,
        week: weekOffset,
        isCurrentWeek: weekOffset === 0,
        dayName: 'Sunday'
      }
    };
  }, [currentWeekState.dates, weekOffset]);

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

  // Initialize rows state
  const [rows, setRows] = useState(() => [
    {
      id: 'row-1',
      cells: ['STAFF', ...Array(numColumns - 1).fill('')]
    },
    {
      id: 'row-2',
      cells: ['C1R2', ...Array(numColumns - 1).fill('')]
    }
  ]);

  // Update first row with weekDays information
  useEffect(() => {
    setRows(currentRows => [
      {
        id: 'row-1',
        cells: [
          'STAFF',
          `${weekDays.monday.dayName}\n${weekDays.monday.date}`,
          `${weekDays.tuesday.dayName}\n${weekDays.tuesday.date}`,
          `${weekDays.wednesday.dayName}\n${weekDays.wednesday.date}`,
          `${weekDays.thursday.dayName}\n${weekDays.thursday.date}`,
          `${weekDays.friday.dayName}\n${weekDays.friday.date}`,
          `${weekDays.saturday.dayName}\n${weekDays.saturday.date}`,
          `${weekDays.sunday.dayName}\n${weekDays.sunday.date}`
        ]
      },
      currentRows[1]
    ]);
  }, [weekDays]);

  // Helper functions to check frozen state
  const isElementFrozen = useCallback((element) => {
    if (!element) return false;
    const style = window.getComputedStyle(element);
    return style.position === 'sticky' && 
           (style.top === '0px' || style.left === '0px') &&
           style.backgroundColor !== 'transparent' &&
           parseInt(style.zIndex) > 0;
  }, []);

  const isRowFrozen = useCallback((rowIndex) => {
    const row = document.querySelector(`tr[data-row-index="${rowIndex}"]`);
    return row && isElementFrozen(row) && window.getComputedStyle(row).top === '0px';
  }, [isElementFrozen]);

  const isColumnFrozen = useCallback((colIndex) => {
    const cell = document.querySelector(`td[data-col-index="${colIndex}"]`);
    return cell && isElementFrozen(cell) && window.getComputedStyle(cell).left === '0px';
  }, [isElementFrozen]);

  // Count frozen elements based on actual CSS properties
  const getFrozenRowCount = useCallback(() => {
    return rows.reduce((count, _, index) => count + (isRowFrozen(index) ? 1 : 0), 0);
  }, [rows, isRowFrozen]);

  const getFrozenColumnCount = useCallback(() => {
    return rows[0]?.cells.reduce((count, _, index) => count + (isColumnFrozen(index) ? 1 : 0), 0) || 0;
  }, [rows, isColumnFrozen]);

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
        days: {
          value: weekDays,
          lastUpdated: new Date().toLocaleTimeString(),
          type: "object"
        },
        numRows: {
          value: rows.length,
          lastUpdated: new Date().toLocaleTimeString(),
          type: "number"
        },
        numColumns: {
          value: numColumns,
          lastUpdated: new Date().toLocaleTimeString(),
          type: "number"
        },
        frozenRows: {
          value: getFrozenRowCount(),
          lastUpdated: new Date().toLocaleTimeString(),
          type: "number"
        },
        frozenColumns: {
          value: getFrozenColumnCount(),
          lastUpdated: new Date().toLocaleTimeString(),
          type: "number"
        },
        rows: {
          value: rows,
          lastUpdated: new Date().toLocaleTimeString(),
          type: "array"
        }
      },
      TabNavigation: {
        activeTab: {
          value: "shifts",
          lastUpdated: new Date().toLocaleTimeString(),
          type: "string"
        },
        tabs: {
          value: ["shifts", "staff", "settings"],
          lastUpdated: new Date().toLocaleTimeString(),
          type: "array"
        }
      }
    });
  }, [
    numColumns, 
    updateDebugVariables, 
    currentDate, 
    currentWeekState, 
    weekOffset, 
    rows,
    getFrozenRowCount,
    getFrozenColumnCount,
    weekDays
  ]);

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
      <div className="mt-4 relative">
        <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={row.id} className="relative" data-row-index={rowIndex}>
                  {row.cells.map((cell, colIndex) => {
                    const isFirstRow = rowIndex === 0;
                    const isFirstCol = colIndex === 0;
                    
                    return (
                      <td
                        key={`${row.id}-cell-${colIndex}`}
                        data-col-index={colIndex}
                        className={`
                          border p-2 ${isFirstCol ? 'min-w-[6.25rem]' : 'min-w-[100px]'}
                          ${isFirstRow ? 'sticky top-0 bg-white z-10' : ''}
                          ${isFirstCol ? 'sticky left-0 bg-white z-20' : ''}
                          ${isFirstRow && isFirstCol ? 'z-30' : ''}
                        `}
                      >
                        {cell}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ShiftTable;
