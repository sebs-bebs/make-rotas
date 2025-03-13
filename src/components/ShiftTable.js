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

  // Track table structure
  const [numColumns, setNumColumns] = useState(8); // Staff name + 7 days of the week
  const [rows, setRows] = useState(() => {
    // Check for existing rows in localStorage
    const savedRows = localStorage.getItem('shiftTableRows');
    if (savedRows) {
      try {
        return JSON.parse(savedRows);
      } catch (e) {
        console.error('Error parsing saved rows:', e);
      }
    }
    
    // Default to empty table with header row and add staff button if nothing saved
    const currentWeekMonday = currentWeekState.dates[0];
    return [
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
        ],
        weekStartDate: currentWeekMonday
      },
      {
        id: 'row-2',
        cells: ['Add Staff', ...Array(numColumns - 1).fill('')],
        weekStartDate: currentWeekMonday
      }
    ];
  });
  
  // Keep track of staff IDs for each row
  const [rowStaffIDs, setRowStaffIDs] = useState(() => {
    const savedStaffIDs = localStorage.getItem('shiftTableStaffIDs');
    return savedStaffIDs ? JSON.parse(savedStaffIDs) : {};
  });
  
  // Track shift data for each staff member
  const [shiftData, setShiftData] = useState(() => {
    const savedShiftData = localStorage.getItem('shiftTableShiftData');
    return savedShiftData ? JSON.parse(savedShiftData) : {};
  });
  
  // State for forcing re-render of shift components
  const [renderKey, setRenderKey] = useState(0);

  // Handle navigation to the previous week
  const handlePrevWeek = useCallback(() => {
    // Save current shift data before navigating
    if (Object.keys(shiftData).length > 0) {
      console.log('Saving current week shift data before navigating to previous week');
      localStorage.setItem('shiftTableShiftData', JSON.stringify(shiftData));
    }
    
    // Set the new week offset
    const newOffset = weekOffset - 1;
    setWeekOffset(newOffset);
    
    // Get the date of the previous week's Monday
    const prevMondayDate = getMondayOfWeek(currentDate, newOffset);
    const prevWeekDates = getWeekDates(prevMondayDate);
    
    // Update current week state
    setCurrentWeek({
      id: prevMondayDate,
      startDate: new Date(prevMondayDate),
      dates: prevWeekDates
    });
    
    // Force re-render
    setRenderKey(prev => prev + 1);
    
    console.log('Navigated to previous week:', prevMondayDate);
  }, [getMondayOfWeek, getWeekDates, weekOffset, currentDate, shiftData]);

  // Handle navigation to the next week
  const handleNextWeek = useCallback(() => {
    // Save current shift data before navigating
    if (Object.keys(shiftData).length > 0) {
      console.log('Saving current week shift data before navigating to next week');
      localStorage.setItem('shiftTableShiftData', JSON.stringify(shiftData));
    }
    
    // Set the new week offset
    const newOffset = weekOffset + 1;
    setWeekOffset(newOffset);
    
    // Get the date of the next week's Monday
    const nextMondayDate = getMondayOfWeek(currentDate, newOffset);
    const nextWeekDates = getWeekDates(nextMondayDate);
    
    // Update current week state
    setCurrentWeek({
      id: nextMondayDate,
      startDate: new Date(nextMondayDate),
      dates: nextWeekDates
    });
    
    // Force re-render
    setRenderKey(prev => prev + 1);
    
    console.log('Navigated to next week:', nextMondayDate);
  }, [getMondayOfWeek, getWeekDates, weekOffset, currentDate, shiftData]);

  // Reset to current week
  const goToCurrentWeek = useCallback(() => {
    // Save current shift data before navigating
    if (Object.keys(shiftData).length > 0) {
      console.log('Saving current week shift data before navigating to current week');
      localStorage.setItem('shiftTableShiftData', JSON.stringify(shiftData));
    }
    
    // Reset week offset to 0
    setWeekOffset(0);
    
    // Get current Monday date
    const currentMondayDate = getCurrentMonday();
    const currentWeekDates = getWeekDates(currentMondayDate);
    
    // Update current week state
    setCurrentWeek({
      id: currentMondayDate,
      startDate: new Date(currentMondayDate),
      dates: currentWeekDates
    });
    
    // Force re-render
    setRenderKey(prev => prev + 1);
    
    console.log('Reset to current week:', currentMondayDate);
  }, [getCurrentMonday, getWeekDates, shiftData]);

  // Check if a date is today
  const isCurrentDay = useCallback((date) => {
    return date === currentDate;
  }, [currentDate]);

  // Check if a date is in the future
  const isFutureDate = useCallback((date) => {
    return new Date(date) > new Date(currentDate);
  }, [currentDate]);

  // Make sure we get fresh shift data when the component mounts
  useEffect(() => {
    const savedShiftData = JSON.parse(localStorage.getItem('shiftTableShiftData') || '{}');
    console.log('Loading shift data on mount:', savedShiftData);
    setShiftData(savedShiftData);
  }, []);

  // Save shiftData to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(shiftData).length > 0) {
      console.log('Saving shiftData to localStorage:', shiftData);
      localStorage.setItem('shiftTableShiftData', JSON.stringify(shiftData));
    }
  }, [shiftData]);

  // Save shift data before navigating weeks
  useEffect(() => {
    // Save current data whenever week changes
    return () => {
      if (Object.keys(shiftData).length > 0) {
        console.log('Saving shift data before week change');
        localStorage.setItem('shiftTableShiftData', JSON.stringify(shiftData));
      }
    };
  }, [currentWeekState.dates, shiftData]);

  // When currentWeekState changes, save any existing shift data and reload for the new week
  useEffect(() => {
    const weekStartDate = currentWeekState.dates[0];
    console.log('Week changed to:', weekStartDate);
    
    // Force reload by incrementing renderKey
    setRenderKey(prev => prev + 1);
  }, [currentWeekState]);

  // Load initial shift data on mount and when shiftData changes
  useEffect(() => {
    console.log("ShiftTable: Loading all shift data");
    
    try {
      // Load all shift data from localStorage
      const savedShiftData = localStorage.getItem('shiftTableShiftData');
      if (savedShiftData) {
        setShiftData(JSON.parse(savedShiftData));
      }
    } catch (error) {
      console.error('Error loading initial shift data:', error);
    }
  }, []);

  // Save rows to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('shiftTableRows', JSON.stringify(rows));
    console.log('Saved rows to localStorage:', rows);
  }, [rows]);

  // Save staff IDs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('shiftTableStaffIDs', JSON.stringify(rowStaffIDs));
  }, [rowStaffIDs]);

  // Clear notification after timeout
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000); // 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Function to load staff list from localStorage and keep stable IDs for rows
  const loadStaffList = useCallback(() => {
    try {
      const savedStaff = JSON.parse(localStorage.getItem('shiftTableStaff') || '[]');
      console.log('Loaded staff list:', savedStaff);
      
      if (savedStaff.length > 0) {
        // Create the header row
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
          ]
        };
        
        // Create staff rows with STABLE IDs (no Date.now())
        const staffRows = savedStaff.map(staffName => ({
          id: `row-staff-${staffName.replace(/\s+/g, '-').toLowerCase()}`,
          cells: [staffName, ...Array(numColumns - 1).fill('')]
        }));
        
        // Create add staff row
        const addStaffRow = {
          id: 'row-2',
          cells: ['Add Staff', ...Array(numColumns - 1).fill('')]
        };
        
        // Set rows state
        setRows([headerRow, ...staffRows, addStaffRow]);
      }
    } catch (error) {
      console.error('Error loading staff list:', error);
    }
  }, [weekDays, numColumns]);

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

  // Find and display the saved shift information for a specific cell
  const getShiftForCell = useCallback((staffName, day) => {
    if (!staffName || !day) return {}; // Return empty object, not null
    
    // Get current week's Monday date
    const weekStartDate = currentWeekState.dates[0];
    
    // Create the week-specific key for this cell
    const weekSpecificKey = `${staffName}_${day}_${weekStartDate}`;
    
    // Log for debugging
    console.log(`Looking for shift: ${weekSpecificKey}`);

    try {
      // Always get fresh data from localStorage to ensure most current data
      const savedShiftData = JSON.parse(localStorage.getItem('shiftTableShiftData') || '{}');
      
      // Check if there is data for this staff/day/week
      if (savedShiftData && savedShiftData[weekSpecificKey]) {
        console.log(`Found shift data for ${weekSpecificKey}:`, savedShiftData[weekSpecificKey]);
        return savedShiftData[weekSpecificKey];
      }
      
      // Nothing found
      console.log(`No shift data found for ${weekSpecificKey}`);
    } catch (error) {
      console.error('Error retrieving shift data:', error);
    }
    
    // Return empty object if nothing found - NEVER return null
    return {};
  }, [currentWeekState.dates]);

  // When a shift time changes, update our state with the new information
  const handleShiftChange = useCallback((staffName, day, startTime, endTime) => {
    // Get current week's Monday date
    const weekStartDate = currentWeekState.dates[0];
    
    // Create the week-specific key for this cell
    const weekSpecificKey = `${staffName}_${day}_${weekStartDate}`;
    
    // Create or update shift data for this cell
    const shiftUpdate = {
      staffName,
      day,
      weekStartDate,
      startTime,
      endTime,
      lastUpdated: new Date().toISOString()
    };
    
    // Log detailed update for debugging
    console.log(`Updating shift for ${staffName} on ${day}:`, {
      key: weekSpecificKey,
      oldData: shiftData[weekSpecificKey] || 'No previous data',
      newData: shiftUpdate
    });
    
    // Update our state with the new shift information
    const updatedShiftData = {
      ...shiftData,
      [weekSpecificKey]: shiftUpdate
    };
    
    // Update state
    setShiftData(updatedShiftData);
    
    // Immediately save to localStorage to prevent data loss
    localStorage.setItem('shiftTableShiftData', JSON.stringify(updatedShiftData));
    
    // Force re-render to ensure data is displayed correctly
    setRenderKey(prev => prev + 1);
    
    // Track in debug
    updateDebugVariables({
      ShiftTable: {
        lastShiftUpdate: {
          value: {
            staffName,
            day,
            weekStartDate,
            startTime,
            endTime,
            timestamp: new Date().toLocaleTimeString()
          },
          lastUpdated: new Date().toLocaleTimeString(),
          type: "object"
        }
      }
    });
  }, [shiftData, currentWeekState.dates, updateDebugVariables]);

  // Render a cell based on its content and position
  const renderCell = useCallback((cell, rowIndex, colIndex) => {
    const row = rows[rowIndex];
    const isFirstRow = rowIndex === 0;
    const isFirstCol = colIndex === 0;
    const isAddStaffRow = row.id === 'row-2';
    
    return (
      <td className="border p-2">
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
            shiftData={getShiftForCell(rows[rowIndex].cells[0], rows[0].cells[colIndex].split('\n')[0])}
            weekStartDate={currentWeekState.dates[0]}
            key={`shift-${rows[rowIndex].cells[0]}-${rows[0].cells[colIndex].split('\n')[0]}-${currentWeekState.dates[0]}-${renderKey}`}
          />
        ) : (
          cell
        )}
      </td>
    );
  }, [rows, handleAddStaffClick, handleShiftChange, getShiftForCell, currentWeekState.dates, renderKey]);

  // Handle adding staff to the roster
  const handleAddStaff = useCallback((staffToAdd) => {
    if (!staffToAdd || staffToAdd.length === 0) return;
    
    // Update our rows state to include the new staff
    setRows(newRows => {
      // Extract all rows except the Add Staff row (last row)
      const contentRows = newRows.filter(row => row.id !== 'row-2');
      
      // Add new staff rows with STABLE IDs
      staffToAdd.forEach(staff => {
        // Create a stable row ID based on staff name
        const stableRowId = `row-staff-${staff.name.replace(/\s+/g, '-').toLowerCase()}`;
        
        // Check if this staff is already in the table
        const staffExists = contentRows.some(row => row.id === stableRowId);
        
        if (!staffExists) {
          contentRows.push({
            id: stableRowId,
            cells: [staff.name, ...Array(numColumns - 1).fill('')]
          });
          
          // Add the staff name to the localStorage staff list
          const savedStaff = JSON.parse(localStorage.getItem('shiftTableStaff') || '[]');
          if (!savedStaff.includes(staff.name)) {
            savedStaff.push(staff.name);
            localStorage.setItem('shiftTableStaff', JSON.stringify(savedStaff));
          }
          
          // Update staff IDs tracking
          setRowStaffIDs(prev => ({
            ...prev,
            [stableRowId]: {
              staffId: staff.id
            }
          }));
        }
      });
      
      // Add the Add Staff row back at the end
      contentRows.push({
        id: 'row-2',
        cells: ['Add Staff', ...Array(numColumns - 1).fill('')]
      });
      
      return contentRows;
    });
    
    // Close the popup
    setIsStaffSelectorOpen(false);
    
    // Show notification
    setNotification(`${staffToAdd.length} staff added`);
    
    // Force reload by incrementing renderKey
    setRenderKey(prev => prev + 1);
    
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

  // Load staff list on mount and when week changes
  useEffect(() => {
    loadStaffList();
  }, [loadStaffList, currentWeekState.dates]);

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

  // Update debug variables whenever important state changes
  useEffect(() => {
    updateDebugVariables({
      ShiftTable: {
        currentWeek: {
          weekOffset,
          startDate: currentWeekState.dates[0],
          allDates: currentWeekState.dates,
          lastUpdated: new Date().toISOString()
        },
        dataStats: {
          rowCount: rows.length,
          shiftCount: Object.keys(shiftData || {}).length,
          staffCount: rows.filter(row => row.id !== 'row-1' && row.id !== 'row-2').length
        }
      }
    });
    
    // Debug log when week changes
    console.log('Week state updated:', {
      weekOffset,
      startDate: currentWeekState.dates[0],
      allDates: currentWeekState.dates
    });
  }, [currentWeekState, rows, shiftData, weekOffset, updateDebugVariables]);

  return (
    <div className="flex-1 overflow-x-auto">
      {/* Navigation Controls */}
      <div className="flex gap-2 mb-4">
        <button 
          onClick={handlePrevWeek}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Previous Week
        </button>
        <button 
          onClick={handleNextWeek}
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
                        className="border p-2"
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
                            shiftData={getShiftForCell(rows[rowIndex].cells[0], rows[0].cells[colIndex].split('\n')[0])}
                            weekStartDate={currentWeekState.dates[0]}
                            key={`shift-${rows[rowIndex].cells[0]}-${rows[0].cells[colIndex].split('\n')[0]}-${currentWeekState.dates[0]}-${renderKey}`}
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
                    className="border p-2"
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
