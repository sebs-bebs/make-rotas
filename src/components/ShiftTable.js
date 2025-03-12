// This file creates a simple table component
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useDebug } from './Debug/DebugContext';
import { useDate } from '../context/DateContext';
import { useStaffDetail } from '../context/StaffDetailContext';
import AddStaffButton from './AddStaffButton';
import StaffSelector from './StaffSelector';
import RemoveButton from './RemoveButton';
import ShiftSlot from './ShiftSlot';

function ShiftTable() {
  const { currentDate, getCurrentMonday, getMondayOfWeek, getWeekDates, currentWeek } = useDate();
  const { updateDebugVariables, debugVariables } = useDebug();
  const { getStaffMember } = useStaffDetail();

  // Track week offset from current week
  const [weekOffset, setWeekOffset] = useState(0);
  
  // State for staff selector popup
  const [isStaffSelectorOpen, setIsStaffSelectorOpen] = useState(false);
  
  // State for notification
  const [notification, setNotification] = useState(null);

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

  // Initialize rows state with local storage data if available
  const [rows, setRows] = useState(() => {
    const savedRows = localStorage.getItem('shiftTableRows');
    if (savedRows) {
      try {
        return JSON.parse(savedRows);
      } catch (error) {
        console.error('Error parsing rows from localStorage:', error);
      }
    }
    
    return [
      {
        id: 'row-1',
        cells: ['STAFF', ...Array(numColumns - 1).fill('')]
      },
      {
        id: 'row-2',
        cells: ['Add Staff', ...Array(numColumns - 1).fill('')]
      }
    ];
  });

  // Keep track of staff IDs in rows for filtering available staff
  const [rowStaffIDs, setRowStaffIDs] = useState(() => {
    const savedIDs = localStorage.getItem('shiftTableStaffIDs');
    return savedIDs ? JSON.parse(savedIDs) : {};
  });

  // Track shift data for each staff member
  const [shiftData, setShiftData] = useState(() => {
    const savedShiftData = localStorage.getItem('shiftTableShiftData');
    return savedShiftData ? JSON.parse(savedShiftData) : {};
  });

  // Save rows to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('shiftTableRows', JSON.stringify(rows));
  }, [rows]);

  // Save staff IDs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('shiftTableStaffIDs', JSON.stringify(rowStaffIDs));
  }, [rowStaffIDs]);

  // Save shift data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('shiftTableShiftData', JSON.stringify(shiftData));
  }, [shiftData]);

  // Clear notification after timeout
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000); // 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Filter rows by week when week changes and update header row
  useEffect(() => {
    // Get current week's Monday date
    const currentWeekMonday = currentWeekState.dates[0];
    
    // Get all saved rows
    const allSavedRows = JSON.parse(localStorage.getItem('shiftTableRows') || '[]');
    
    // Filter rows to only include staff for the current week
    setRows(() => {
      // Create the header row with updated week information
      const headerRow = {
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
        ],
        weekStartDate: currentWeekMonday
      };
      
      // Add staff row for adding new staff
      const addStaffRow = {
        id: 'row-2',
        cells: ['Add Staff', ...Array(numColumns - 1).fill('')],
        weekStartDate: currentWeekMonday
      };
      
      // Filter staff rows to only include those for the current week
      const filteredStaffRows = allSavedRows.filter(row => {
        // Skip header and add staff rows 
        if (row.id === 'row-1' || row.id === 'row-2') return false;
        
        // Include only staff rows associated with the current week
        return row.weekStartDate === currentWeekMonday;
      });
      
      return [headerRow, ...filteredStaffRows, addStaffRow];
    });
  }, [weekDays, currentWeekState.dates, numColumns]);

  // Handle opening the staff selector
  const handleAddStaffClick = useCallback(() => {
    setIsStaffSelectorOpen(true);
    
    // Track in debug
    updateDebugVariables({
      ShiftTable: {
        addStaffButtonClicked: {
          value: true,
          lastUpdated: new Date().toLocaleTimeString(),
          type: "boolean"
        }
      }
    });
  }, [updateDebugVariables]);

  // Handle adding selected staff to the rota
  const handleAddStaff = useCallback((staffToAdd) => {
    if (!staffToAdd || staffToAdd.length === 0) return;
    
    // Get current week's Monday date for tracking
    const currentWeekMonday = currentWeekState.dates[0];
    
    // Add new rows for each selected staff
    setRows(currentRows => {
      const newRows = [...currentRows];
      
      // Extract all rows except the Add Staff row (last row)
      const contentRows = newRows.filter(row => row.id !== 'row-2');
      
      // Add new staff rows
      staffToAdd.forEach(staff => {
        // Create a week-specific row ID that includes the week start date
        const newRowId = `row-${Date.now()}-${staff.id}-${currentWeekMonday}`;
        contentRows.push({
          id: newRowId,
          cells: [staff.name, ...Array(numColumns - 1).fill('')],
          weekStartDate: currentWeekMonday // Store the week info directly in the row
        });
        
        // Update staff IDs tracking with week information
        setRowStaffIDs(prev => ({
          ...prev,
          [newRowId]: {
            staffId: staff.id,
            weekStartDate: currentWeekMonday
          }
        }));
      });
      
      // Add the Add Staff row back at the end
      contentRows.push({
        id: 'row-2',
        cells: ['Add Staff', ...Array(numColumns - 1).fill('')],
        weekStartDate: currentWeekMonday
      });
      
      return contentRows;
    });
    
    // Close the popup
    setIsStaffSelectorOpen(false);
    
    // Show notification
    setNotification(`${staffToAdd.length} staff added`);
    
    // Track in debug
    updateDebugVariables({
      ShiftTable: {
        staffAdded: {
          value: staffToAdd.map(s => s.name),
          lastUpdated: new Date().toLocaleTimeString(),
          type: "array"
        },
        totalRows: {
          value: rows.length + staffToAdd.length,
          lastUpdated: new Date().toLocaleTimeString(),
          type: "number"
        }
      }
    });
  }, [rows.length, numColumns, updateDebugVariables]);

  // Handle removing staff from the rota
  const handleRemoveStaff = useCallback((rowId) => {
    // Find the row index
    const rowIndex = rows.findIndex(row => row.id === rowId);
    if (rowIndex === -1 || rowId === 'row-1' || rowId === 'row-2') return; // Don't remove header or add staff row

    // Get staff info for debug
    const staffId = rowStaffIDs[rowId];
    const staffName = rows[rowIndex].cells[0];

    // Remove row from rows
    setRows(currentRows => {
      return currentRows.filter(row => row.id !== rowId);
    });

    // Remove from staff IDs tracking
    setRowStaffIDs(prev => {
      const newRowStaffIDs = { ...prev };
      delete newRowStaffIDs[rowId];
      return newRowStaffIDs;
    });
    
    // Remove all shift data for this staff member
    setShiftData(prev => {
      const newShiftData = { ...prev };
      // Delete all entries that start with staffName_
      Object.keys(newShiftData).forEach(key => {
        if (key.startsWith(`${staffName}_`)) {
          delete newShiftData[key];
        }
      });
      return newShiftData;
    });

    // Show notification
    setNotification(`${staffName} removed from rota`);

    // Track in debug
    updateDebugVariables({
      ShiftTable: {
        staffRemoved: {
          value: staffName,
          lastUpdated: new Date().toLocaleTimeString(),
          type: "string"
        },
        totalRows: {
          value: rows.length - 1,
          lastUpdated: new Date().toLocaleTimeString(),
          type: "number"
        }
      }
    });
  }, [rows, rowStaffIDs, updateDebugVariables]);

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

  // Get the current staff IDs that are already in the rota
  const currentStaffIds = useMemo(() => {
    return Object.values(rowStaffIDs);
  }, [rowStaffIDs]);

  // Handle shift time changes
  const handleShiftChange = useCallback((staffName, day, startTime, endTime) => {
    // Get current week's Monday date as an identifier
    const weekStartDate = currentWeekState.dates[0]; // Monday's date in YYYY-MM-DD format
    
    // Update shift data with week information
    setShiftData(prev => ({
      ...prev,
      [`${staffName}_${day}_${weekStartDate}`]: {
        startTime,
        endTime,
        weekStartDate, // Store the week this shift belongs to
        dayDate: weekDays[day.toLowerCase()]?.date || '', // Store the specific date
        lastUpdated: new Date().toISOString()
      }
    }));
  }, [currentWeekState.dates, weekDays]);
  
  // Find and display the saved shift information for a specific cell
  const getShiftForCell = useCallback((staffName, day) => {
    // Get current week's Monday date
    const weekStartDate = currentWeekState.dates[0];
    
    // Look for shifts only in the current week
    const weekSpecificKey = `${staffName}_${day}_${weekStartDate}`;
    return shiftData?.[weekSpecificKey] || {};
  }, [shiftData, currentWeekState.dates]);

  // Format shift data for the debug view to avoid duplication
  const formatShiftDataForDebug = useCallback(() => {
    // Create a hierarchical structure grouped by staff, week, and day
    const staffShifts = {};
    
    // Process the shift data from the flattened structure to a hierarchical one
    Object.entries(shiftData || {}).forEach(([key, data]) => {
      // Parse the key which now includes weekStartDate: staffName_day_weekStartDate
      const keyParts = key.split('_');
      
      // Skip if not enough parts
      if (keyParts.length < 2) return;
      
      let staffName, day, weekStartDate;
      
      if (keyParts.length >= 3) {
        // New format: staffName_day_weekStartDate
        weekStartDate = keyParts[keyParts.length - 1];
        day = keyParts[keyParts.length - 2];
        staffName = keyParts.slice(0, keyParts.length - 2).join('_');
      } else {
        // Legacy format: staffName_day
        [staffName, day] = keyParts;
        weekStartDate = 'unknown';
      }
      
      // Skip if we don't have enough information
      if (!staffName || !day || !data.startTime || !data.endTime) return;
      
      // Initialize staff object if needed
      if (!staffShifts[staffName]) {
        staffShifts[staffName] = {};
      }
      
      // Group by day but use the week information for unique identification
      const dayKey = `${day}_${data.weekStartDate || weekStartDate || 'unknown'}`;
      
      const [startHour, startMinute] = data.startTime.split(':').map(Number);
      const [endHour, endMinute] = data.endTime.split(':').map(Number);
      
      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;
      
      const durationMinutes = endTotalMinutes - startTotalMinutes;
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      
      // Use the stored dayDate instead of current week's date
      staffShifts[staffName][dayKey] = {
        startTime: data.startTime,
        endTime: data.endTime,
        duration: `${hours}:${minutes.toString().padStart(2, '0')}`,
        hoursWorked: hours + (minutes / 60),
        dayOfWeek: day,
        date: data.dayDate || 'unknown',
        weekStartDate: data.weekStartDate || weekStartDate || 'unknown'
      };
    });
    
    return staffShifts;
  }, [shiftData]);

  // Update debug variables
  useEffect(() => {
    const formattedShiftData = formatShiftDataForDebug();
    
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
        isOpen: {
          value: isStaffSelectorOpen,
          lastUpdated: new Date().toLocaleTimeString(),
          type: "boolean"
        },
        notification: {
          value: notification,
          lastUpdated: new Date().toLocaleTimeString(),
          type: "string"
        },
        staffShifts: {
          value: formattedShiftData,
          lastUpdated: new Date().toLocaleTimeString(),
          type: "object",
          description: "Staff shift schedules organized by staff member and day"
        }
      }
    });
  }, [
    updateDebugVariables,
    currentDate,
    weekOffset,
    currentWeekState.dates,
    weekDays,
    rows.length,
    numColumns,
    getFrozenRowCount,
    getFrozenColumnCount,
    isStaffSelectorOpen,
    rowStaffIDs,
    currentStaffIds,
    notification,
    formatShiftDataForDebug
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
                    const isAddStaffRow = row.id === 'row-2';
                    
                    return (
                      <td
                        key={`${row.id}-cell-${colIndex}`}
                        data-col-index={colIndex}
                        className={`
                          border p-2 ${isFirstCol ? 'min-w-[7.5rem]' : 'min-w-[100px]'}
                          ${isFirstRow ? 'sticky top-0 bg-white z-10' : ''}
                          ${isFirstCol ? 'sticky left-0 bg-white z-20' : ''}
                          ${isFirstRow && isFirstCol ? 'z-30' : ''}
                        `}
                      >
                        {isAddStaffRow && colIndex === 0 ? (
                          <AddStaffButton onClick={handleAddStaffClick} />
                        ) : isFirstRow || colIndex === 0 ? (
                          cell
                        ) : (!isFirstRow && !isAddStaffRow) ? (
                          <ShiftSlot
                            staffName={rows[rowIndex].cells[0]}
                            day={rows[0].cells[colIndex].split('\n')[0]} // Get day name from header
                            rowId={row.id}
                            colIndex={colIndex}
                            onShiftChange={handleShiftChange}
                          />
                        ) : (
                          cell
                        )}
                      </td>
                    );
                  })}
                  {/* Actions column with Remove button */}
                  <td
                    key={`${row.id}-action`}
                    className="border p-2 min-w-[100px]"
                  >
                    {rowIndex === 0 ? (
                      'ACTIONS'
                    ) : row.id === 'row-2' ? (
                      ''
                    ) : (
                      <RemoveButton onRemove={() => handleRemoveStaff(row.id)} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Notification */}
        {notification && (
          <div className="fixed bottom-4 right-4 border px-4 py-2 rounded">
            {notification}
          </div>
        )}
      </div>
      
      {/* Staff Selector Popup */}
      <StaffSelector
        isOpen={isStaffSelectorOpen}
        onClose={() => setIsStaffSelectorOpen(false)}
        onAddStaff={handleAddStaff}
        currentStaffIds={currentStaffIds}
      />
    </div>
  );
}

export default ShiftTable;
