// This file creates a simple table component
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useDebug } from './Debug/DebugContext';
import { useDate } from '../context/DateContext';
import { useStaffDetail } from '../context/StaffDetailContext';
import AddStaffButton from './AddStaffButton';
import StaffSelector from './StaffSelector';
import RemoveButton from './RemoveButton';
import ShiftSlot from './ShiftSlot';
import ShiftEditor from './ShiftEditor'; // Import the ShiftEditor component

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
    const savedRowsData = localStorage.getItem('shiftTableRowsByWeek');
    if (savedRowsData) {
      try {
        const rowsByWeek = JSON.parse(savedRowsData);
        const currentWeekMonday = currentWeekState.dates[0];
        return rowsByWeek[currentWeekMonday] || [];
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
  
  // State for all available staff in the system
  const [availableStaff, setAvailableStaff] = useState(() => {
    const savedStaff = localStorage.getItem('shiftTableStaff');
    const staffList = savedStaff ? JSON.parse(savedStaff) : [];
    return staffList.map(name => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name
    }));
  });
  
  // Get the current staff IDs that are already in the rota
  const currentStaffIds = useMemo(() => {
    return Object.values(rowStaffIDs);
  }, [rowStaffIDs]);

  // Fix the issue by creating a different prop to pass to StaffSelector
  // that directly uses the staff names from the table
  const staffNamesInTable = useMemo(() => {
    return rows
      .filter(row => row.id !== 'row-1' && row.id !== 'row-2')
      .map(row => row.cells[0]);
  }, [rows]);

  // Debug currentStaffIds calculation
  useEffect(() => {
    console.log('DEBUG ShiftTable - rowStaffIDs updated:', rowStaffIDs);
    console.log('DEBUG ShiftTable - calculated currentStaffIds:', currentStaffIds);
    
    // Also log the actual rows to see staff names in the table
    const staffInRows = rows
      .filter(row => row.id !== 'row-1' && row.id !== 'row-2')
      .map(row => row.cells[0]);
    console.log('DEBUG ShiftTable - Staff names in rows:', staffInRows);
  }, [rowStaffIDs, currentStaffIds, rows]);

  // Handle navigation to the previous week
  const handlePrevWeek = useCallback(() => {
    // Calculate the new week offset
    const newOffset = weekOffset - 1;
    setWeekOffset(newOffset);
    
    // Update currentWeekState with the new dates
    const mondayDate = getMondayOfWeek(currentDate, newOffset);
    const dates = getWeekDates(mondayDate);
    
    // Update week state with the new dates
    setCurrentWeek({
      dates,
      isCurrentWeek: newOffset === 0
    });
    
    updateDebugVariables({
      ShiftTable: {
        weekOffset: {
          value: newOffset,
          lastUpdated: new Date().toLocaleTimeString(),
          type: "number"
        },
        weekAction: {
          value: 'Previous week clicked',
          lastUpdated: new Date().toLocaleTimeString(),
          type: "string"
        }
      }
    });
    
    console.log('Navigated to previous week, new offset:', newOffset);
  }, [weekOffset, updateDebugVariables, currentDate]);

  // Handle navigation to the next week
  const handleNextWeek = useCallback(() => {
    // Calculate the new week offset
    const newOffset = weekOffset + 1;
    setWeekOffset(newOffset);
    
    // Update currentWeekState with the new dates
    const mondayDate = getMondayOfWeek(currentDate, newOffset);
    const dates = getWeekDates(mondayDate);
    
    // Update week state with the new dates
    setCurrentWeek({
      dates,
      isCurrentWeek: newOffset === 0
    });
    
    updateDebugVariables({
      ShiftTable: {
        weekOffset: {
          value: newOffset,
          lastUpdated: new Date().toLocaleTimeString(),
          type: "number"
        },
        weekAction: {
          value: 'Next week clicked',
          lastUpdated: new Date().toLocaleTimeString(),
          type: "string"
        }
      }
    });
    
    console.log('Navigated to next week, new offset:', newOffset);
  }, [weekOffset, updateDebugVariables, currentDate]);

  // Handle navigation to the current week
  const handleCurrentWeek = useCallback(() => {
    // Reset to current week
    setWeekOffset(0);
    
    // Update currentWeekState with current week's dates
    const mondayDate = getMondayOfWeek(currentDate, 0);
    const dates = getWeekDates(mondayDate);
    
    // Update week state
    setCurrentWeek({
      dates,
      isCurrentWeek: true
    });
    
    updateDebugVariables({
      ShiftTable: {
        weekOffset: {
          value: 0,
          lastUpdated: new Date().toLocaleTimeString(),
          type: "number"
        },
        weekAction: {
          value: 'Current week clicked',
          lastUpdated: new Date().toLocaleTimeString(),
          type: "string"
        }
      }
    });
    
    console.log('Navigated to current week');
  }, [updateDebugVariables, currentDate]);

  // Check if a date is today
  const isCurrentDay = useCallback((date) => {
    return date === currentDate;
  }, [currentDate]);

  // Check if a date is in the future
  const isFutureDate = useCallback((date) => {
    return new Date(date) > new Date(currentDate);
  }, [currentDate]);

  // Helper function to get the date for a specific day of the week
  const getDateForDay = useCallback((dayName, weekDates) => {
    const dayMap = {
      'Monday': 0,
      'Tuesday': 1,
      'Wednesday': 2,
      'Thursday': 3,
      'Friday': 4,
      'Saturday': 5,
      'Sunday': 6
    };
    
    // Extract just the day name if it contains a date
    const pureDayName = dayName.split('\n')[0];
    
    // Get the index for this day
    const dayIndex = dayMap[pureDayName];
    
    // Return the date if we have it, otherwise the week start date
    return weekDates && dayIndex !== undefined && weekDates[dayIndex] 
      ? weekDates[dayIndex] 
      : weekDates ? weekDates[0] : 'unknown';
  }, []);

  // Update handleShiftChange to properly store week-specific shift data
  const handleShiftChange = useCallback((staffName, day, startTime, endTime, weekStartDate = null) => {
    // Use current week's Monday date if weekStartDate not provided
    const actualWeekStartDate = weekStartDate || currentWeekState.dates[0];
    
    console.log(`DEBUG: ShiftTable.handleShiftChange called with:`, {
      staffName,
      day,
      startTime,
      endTime,
      weekStartDate: actualWeekStartDate
    });
    
    // Create the week-specific key to look up shift data
    const shiftKey = `${staffName}_${day}_${actualWeekStartDate}`;
    
    // Update shift data
    setShiftData(prev => {
      const newData = {
        ...prev,
        [shiftKey]: {
          startTime,
          endTime,
          weekStartDate: actualWeekStartDate,
          lastUpdated: new Date().toISOString()
        }
      };
      
      console.log(`DEBUG: ShiftTable updated shiftData:`, {
        key: shiftKey,
        newShift: newData[shiftKey]
      });
      
      return newData;
    });
  }, [currentWeekState.dates]);

  // Make sure we get fresh shift data when the component mounts
  useEffect(() => {
    try {
      // Load all shift data from localStorage
      const savedShiftData = JSON.parse(localStorage.getItem('shiftTableShiftData') || '{}');
      console.log('Loaded shift data from localStorage:', Object.keys(savedShiftData).length, 'entries');
      
      // Set the shift data state
      setShiftData(savedShiftData);
    } catch (error) {
      console.error('Error loading shift data from localStorage:', error);
    }
  }, []);

  // Get only the shifts relevant to the current week
  const getCurrentWeekShifts = useCallback(() => {
    const currentWeekMonday = currentWeekState.dates[0];
    
    // Filter shifts specific to this week
    const shiftsForCurrentWeek = {};
    
    Object.entries(shiftData || {}).forEach(([key, data]) => {
      // Key format is: staffName_day_weekStartDate
      const keyParts = key.split('_');
      
      // Only include shifts from this week
      if (keyParts.length >= 3 && keyParts[keyParts.length - 1] === currentWeekMonday) {
        shiftsForCurrentWeek[key] = data;
      }
    });
    
    console.log(`Found ${Object.keys(shiftsForCurrentWeek).length} shifts for current week ${currentWeekMonday}`);
    return shiftsForCurrentWeek;
  }, [currentWeekState.dates, shiftData]);

  // Save shiftData to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(shiftData).length > 0) {
      console.log('Saving shiftData to localStorage:', shiftData);
      try {
        localStorage.setItem('shiftTableShiftData', JSON.stringify(shiftData));
      } catch (error) {
        console.error('Error saving shift data to localStorage:', error);
      }
    }
  }, [shiftData]);

  // Save shift data before navigating weeks
  useEffect(() => {
    // Save current data whenever week changes
    return () => {
      if (Object.keys(shiftData).length > 0) {
        console.log('Saving shift data before week change');
        try {
          localStorage.setItem('shiftTableShiftData', JSON.stringify(shiftData));
        } catch (error) {
          console.error('Error saving shift data to localStorage:', error);
        }
      }
    };
  }, [currentWeekState.dates, shiftData]);

  // CRITICAL FIX: When currentWeekState changes, we must DIRECTLY update the rows
  // instead of just setting renderKey and relying on another useEffect
  useEffect(() => {
    const weekStartDate = currentWeekState.dates[0];
    console.log('🔄 DIRECT WEEK UPDATE: Changed to week starting', weekStartDate);
    
    try {
      // Get the staff for this specific week
      const staffByWeek = JSON.parse(localStorage.getItem('shiftTableStaffByWeek') || '{}');
      const staffForThisWeek = staffByWeek[weekStartDate] || [];
      
      console.log('📊 DIRECT WEEK UPDATE: Found staff for this week:', {
        week: weekStartDate,
        staffCount: staffForThisWeek.length,
        staff: staffForThisWeek
      });
      
      // Always create header row for this week
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
        weekStartDate
      };
      
      // Always have "Add Staff" row
      const addStaffRow = {
        id: 'row-2',
        cells: ['Add Staff', ...Array(numColumns - 1).fill('')],
        weekStartDate
      };
      
      // Build rows for ONLY this week's staff
      const staffRows = staffForThisWeek.map(staffName => {
        const stableRowId = `row-staff-${staffName.replace(/\s+/g, '-').toLowerCase()}`;
        return {
          id: stableRowId,
          cells: [staffName, ...Array(numColumns - 1).fill('')],
          weekStartDate
        };
      });
      
      // Combine all rows in proper order
      const newRows = [
        headerRow,
        ...staffRows,
        addStaffRow
      ];
      
      console.log(`📋 DIRECT WEEK UPDATE: Setting ${newRows.length} rows for week ${weekStartDate}`);
      
      // IMPORTANT: Always replace all rows with the week-specific rows
      setRows(newRows);
      
      // Force a re-render using the renderKey
      setRenderKey(prev => prev + 1);
      
      console.log(`✅ DIRECT WEEK UPDATE: Successfully loaded ${staffForThisWeek.length} staff for week ${weekStartDate}`);
    } catch (error) {
      console.error('❌ DIRECT WEEK UPDATE: Error loading staff for week:', error);
      
      // Fallback to a clean slate with header and add button
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
        weekStartDate
      };
      
      const addStaffRow = {
        id: 'row-2',
        cells: ['Add Staff', ...Array(numColumns - 1).fill('')],
        weekStartDate
      };
      
      setRows([headerRow, addStaffRow]);
    }
  }, [currentWeekState, weekDays, numColumns]);

  // Load initial shift data on mount and when shiftData changes
  useEffect(() => {
    console.log(" ShiftTable: Loading all shift data");
    
    try {
      // Load all shift data from localStorage
      const savedShiftData = localStorage.getItem('shiftTableShiftData');
      if (savedShiftData) {
        setShiftData(JSON.parse(savedShiftData));
      }
    } catch (error) {
      console.error(' Error loading initial shift data:', error);
    }
  }, []);

  // Save rows to localStorage whenever they change
  const saveRows = useCallback(() => {
    try {
      const currentWeekMonday = currentWeekState.dates[0];
      console.log(` Saving rows for week ${currentWeekMonday}...`);
      
      // Get existing rows by week data
      const savedRowsByWeek = JSON.parse(localStorage.getItem('shiftTableRowsByWeek') || '{}');
      
      // Update with current rows data for this week
      savedRowsByWeek[currentWeekMonday] = rows;
      
      // Save back to localStorage
      localStorage.setItem('shiftTableRowsByWeek', JSON.stringify(savedRowsByWeek));
      
      // Also ensure our staff by week data is in sync
      const staffByWeek = JSON.parse(localStorage.getItem('shiftTableStaffByWeek') || '{}');
      
      // Get all staff currently in the table (excluding header and Add Staff rows)
      const currentStaff = rows
        .filter(row => row.id !== 'row-1' && row.id !== 'row-2')
        .map(row => row.cells[0]);
      
      // Update staff by week data
      staffByWeek[currentWeekMonday] = currentStaff;
      
      // Save back to localStorage
      localStorage.setItem('shiftTableStaffByWeek', JSON.stringify(staffByWeek));
      
      console.log(` Saved ${rows.length} rows for week ${currentWeekMonday}`);
    } catch (error) {
      console.error(' Error saving rows:', error);
    }
  }, [rows, currentWeekState.dates]);

  useEffect(() => {
    // Only save if we have actual rows
    if (rows.length > 0) {
      saveRows();
    }
  }, [rows, saveRows]);

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

  // Fix the staff selection process to prevent showing staff already in the table
  const handleAddStaffClick = useCallback(() => {
    console.log('🔘 ADD STAFF BUTTON: Button clicked');
    
    try {
      // 1. Get all staff from StaffList context
      const { getStaffMember } = require('../context/StaffDetailContext').useStaffDetail();
      const allContextStaff = getStaffMember();
      
      // Format staff from context
      const availableStaffFromContext = allContextStaff
        .filter(staff => staff.inList === true)
        .map(staff => ({
          id: staff.staffID,
          name: staff.fullName,
          role: staff.role || ''
        }));
      
      // 2. Get staff names that already appear in the table rows
      const staffNamesInTable = rows
        .filter(row => row.id !== 'row-1' && row.id !== 'row-2') // Skip header and add staff rows
        .map(row => row.cells[0]);                               // Staff name is in first cell
      
      console.log('🔍 ADD STAFF BUTTON: Staff already in table:', staffNamesInTable);
      
      // 3. Filter out staff already in the table
      const filteredStaff = availableStaffFromContext.filter(
        staff => !staffNamesInTable.includes(staff.name)
      );
      
      console.log('📋 ADD STAFF BUTTON: Filtered staff for selector:', {
        availableCount: filteredStaff.length,
        available: filteredStaff,
        alreadyInTable: staffNamesInTable
      });
      
      // 4. Set filtered staff as available and open selector
      setAvailableStaff(filteredStaff);
      setIsStaffSelectorOpen(true);
    } catch (error) {
      console.error('❌ ADD STAFF BUTTON: Error preparing staff for selector:', error);
      // Fallback to original method if there's an error
      const allStaffFromLocal = JSON.parse(localStorage.getItem('shiftTableStaff') || '[]');
      const staffInTableRows = rows
        .filter(row => row.id !== 'row-1' && row.id !== 'row-2')
        .map(row => row.cells[0]);
      
      setAvailableStaff(
        allStaffFromLocal
          .filter(name => !staffInTableRows.includes(name))
          .map(name => ({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name
          }))
      );
      setIsStaffSelectorOpen(true);
    }
    
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
  }, [rows, setIsStaffSelectorOpen, updateDebugVariables]);

  // Handle adding staff to the roster
  const handleAddStaff = useCallback((staffToAdd) => {
    if (!staffToAdd || (Array.isArray(staffToAdd) && staffToAdd.length === 0)) return;
    
    // Get the current week's Monday date for week-specific storage
    const currentWeekMonday = currentWeekState.dates[0];
    
    console.log(`🧑‍💼 ADD STAFF: Adding staff to week starting ${currentWeekMonday}:`, staffToAdd);
    
    try {
      // Handle both single staff member or array
      const staffMembers = Array.isArray(staffToAdd) ? staffToAdd : [{ name: staffToAdd }];
      
      // Extract just the names of staff being added
      const staffNamesBeingAdded = staffMembers.map(staff => 
        typeof staff === 'string' ? staff : staff.name
      );
      
      console.log(`📋 ADD STAFF: Staff names being added to week ${currentWeekMonday}:`, staffNamesBeingAdded);
      
      // IMPORTANT STEP 1: Add to global staff list first (for the staff selector)
      // This makes staff available to be added to ANY week
      const globalStaffList = JSON.parse(localStorage.getItem('shiftTableStaff') || '[]');
      let updatedGlobalStaffList = [...globalStaffList];
      
      // Add any new staff to the global list
      staffNamesBeingAdded.forEach(staffName => {
        if (!updatedGlobalStaffList.includes(staffName)) {
          updatedGlobalStaffList.push(staffName);
        }
      });
      
      // Save updated global staff list
      localStorage.setItem('shiftTableStaff', JSON.stringify(updatedGlobalStaffList));
      console.log('🌐 ADD STAFF: Updated global staff list:', updatedGlobalStaffList);
      
      // IMPORTANT STEP 2: Update week-specific staff list
      const staffByWeek = JSON.parse(localStorage.getItem('shiftTableStaffByWeek') || '{}');
      
      // Initialize array for this week if it doesn't exist
      if (!staffByWeek[currentWeekMonday]) {
        staffByWeek[currentWeekMonday] = [];
      }
      
      // Get current list for this week
      const currentWeekStaff = staffByWeek[currentWeekMonday];
      
      // Add new staff to this specific week only
      let staffChanged = false;
      staffNamesBeingAdded.forEach(staffName => {
        if (!currentWeekStaff.includes(staffName)) {
          currentWeekStaff.push(staffName);
          staffChanged = true;
        } else {
          console.warn(`⚠️ ADD STAFF: "${staffName}" is already in the table for week ${currentWeekMonday}`);
        }
      });
      
      // Save if anything changed
      if (staffChanged) {
        localStorage.setItem('shiftTableStaffByWeek', JSON.stringify(staffByWeek));
        console.log(`✅ ADD STAFF: Updated staff for week ${currentWeekMonday}:`, currentWeekStaff);
      }
      
      // IMPORTANT STEP 3: Update UI for the current week only
      setRows(currentRows => {
        // Keep header row
        const headerRow = currentRows.find(row => row.id === 'row-1');
        const addStaffRow = currentRows.find(row => row.id === 'row-2');
        
        // Remove add staff row temporarily
        const contentRows = currentRows.filter(row => row.id !== 'row-1' && row.id !== 'row-2');
        
        // Create new rows array starting with header
        const newRows = [headerRow];
        
        // Add existing rows first
        contentRows.forEach(row => {
          newRows.push(row);
        });
        
        // Add new staff rows for this week
        staffNamesBeingAdded.forEach(staffName => {
          const stableRowId = `row-staff-${staffName.replace(/\s+/g, '-').toLowerCase()}`;
          
          // Only add if not already in table
          if (!newRows.some(row => row.id === stableRowId)) {
            newRows.push({
              id: stableRowId,
              cells: [staffName, ...Array(numColumns - 1).fill('')],
              weekStartDate: currentWeekMonday // CRITICAL: Explicitly tag with current week
            });
          }
        });
        
        // Add the Add Staff row at the end
        newRows.push(addStaffRow);
        
        return newRows;
      });
      
      // Close the staff selector popup
      setIsStaffSelectorOpen(false);
      
      // Show notification
      setNotification(`${staffNamesBeingAdded.length} staff added to THIS WEEK ONLY`);
      
      // Force a re-render
      setRenderKey(prev => prev + 1);
      
      // Track in debug
      updateDebugVariables({
        ShiftTable: {
          lastStaffAdded: {
            value: {
              staff: staffNamesBeingAdded,
              week: currentWeekMonday,
              timestamp: new Date().toLocaleTimeString()
            },
            lastUpdated: new Date().toLocaleTimeString(),
            type: "object"
          }
        }
      });
      
      console.log(`🔄 ADD STAFF: Completed adding staff to week ${currentWeekMonday}`);
    } catch (error) {
      console.error('❌ ADD STAFF: Error adding staff:', error);
      setNotification(`Error adding staff: ${error.message}`);
    }
  }, [currentWeekState.dates, numColumns, setIsStaffSelectorOpen, setNotification, updateDebugVariables]);
  
  // Handle click on a shift cell
  const handleShiftCellClick = useCallback((rowIndex, colIndex, staffName, day) => {
    // Skip header and first column
    if (rowIndex === 0 || colIndex === 0 || !staffName || !day) return;
    
    // Get the current week's Monday date
    const currentWeekMonday = currentWeekState.dates[0];
    
    // Create the week-specific key to look up shift data
    const shiftKey = `${staffName}_${day}_${currentWeekMonday}`;
    const existingShiftData = shiftData?.[shiftKey] || null;
    
    // Set up data for the shift editor
    setEditingShift({
      staffName,
      day,
      startTime: existingShiftData?.startTime || '',
      endTime: existingShiftData?.endTime || '',
      weekStartDate: currentWeekMonday,
      rowId: rows[rowIndex].id,
      colIndex
    });
    
    // Open the editor
    setShiftEditorOpen(true);
    
    // Debug log
    console.log(`Opening shift editor for ${staffName} on ${day} in week ${currentWeekMonday}:`, existingShiftData);
  }, [currentWeekState.dates, rows, shiftData]);

  // Handle saving from the shift editor
  const handleShiftSave = useCallback((staffName, day, startTime, endTime, weekStartDate) => {
    if (!staffName || !day) return;
    
    // Make sure we have the correct week start date
    const actualWeekStartDate = weekStartDate || currentWeekState.dates[0];
    
    // Save the shift data with the explicit week
    handleShiftChange(staffName, day, startTime, endTime, actualWeekStartDate);
    
    // Close the editor
    setShiftEditorOpen(false);
    
    // Clear editing state
    setEditingShift(null);
    
    // Force re-render
    setRenderKey(prev => prev + 1);
    
    // Show confirmation
    if (startTime && endTime) {
      setNotification(`Shift saved for ${staffName} on ${day} (${startTime}-${endTime})`);
    } else {
      setNotification(`Shift removed for ${staffName} on ${day}`);
    }
  }, [currentWeekState.dates, handleShiftChange, setNotification]);

  // Handle removing staff from the roster
  const handleRemoveStaff = useCallback((staffRowId, staffName) => {
    // Get the current week's Monday date
    const currentWeekMonday = currentWeekState.dates[0];
    
    console.log(`🗑️ REMOVE STAFF: Removing '${staffName}' ONLY from week ${currentWeekMonday}`);
    
    // STEP 1: Update UI by removing the row
    setRows(prev => {
      // Filter out the specific staff row to be removed
      return prev.filter(row => row.id !== staffRowId);
    });
    
    // STEP 2: Update the week-specific staff list in localStorage
    try {
      const staffByWeek = JSON.parse(localStorage.getItem('shiftTableStaffByWeek') || '{}');
      
      console.log(`📊 REMOVE STAFF: Current staffByWeek data:`, staffByWeek);
      
      // Remove staff from this week's list only
      if (staffByWeek[currentWeekMonday]) {
        staffByWeek[currentWeekMonday] = staffByWeek[currentWeekMonday].filter(name => name !== staffName);
        
        // Save updated staff by week data
        localStorage.setItem('shiftTableStaffByWeek', JSON.stringify(staffByWeek));
        console.log(`✅ REMOVE STAFF: Removed '${staffName}' from week ${currentWeekMonday}`);
        console.log(`📊 REMOVE STAFF: Updated week data:`, staffByWeek[currentWeekMonday]);
      }
    } catch (error) {
      console.error('❌ REMOVE STAFF: Error updating staff by week data:', error);
    }
    
    // STEP 3: Remove shift data for this staff in this week
    try {
      const shiftDataCopy = { ...shiftData };
      let shiftsRemoved = 0;
      
      // Find and remove all shifts for this staff in this week
      Object.keys(shiftDataCopy).forEach(key => {
        // Key format is: staffName_day_weekStartDate
        if (key.startsWith(`${staffName}_`) && key.endsWith(`_${currentWeekMonday}`)) {
          delete shiftDataCopy[key];
          shiftsRemoved++;
          console.log(`🗑️ REMOVE STAFF: Removed shift data for ${key}`);
        }
      });
      
      // Update state and localStorage
      setShiftData(shiftDataCopy);
      localStorage.setItem('shiftTableShiftData', JSON.stringify(shiftDataCopy));
      console.log(`✅ REMOVE STAFF: Removed ${shiftsRemoved} shifts for ${staffName} in week ${currentWeekMonday}`);
    } catch (error) {
      console.error('❌ REMOVE STAFF: Error removing shift data:', error);
    }
    
    // STEP 4: Force re-render to update UI
    setRenderKey(prev => {
      console.log('🔄 REMOVE STAFF: Incrementing renderKey to force refresh');
      return prev + 1;
    });
    
    // STEP 5: Show notification
    setNotification(`Removed ${staffName} from THIS WEEK ONLY`);
    
    // Track in debug
    updateDebugVariables({
      ShiftTable: {
        lastStaffRemoved: {
          value: {
            staff: staffName,
            week: currentWeekMonday,
            timestamp: new Date().toLocaleTimeString()
          },
          lastUpdated: new Date().toLocaleTimeString(),
          type: "object"
        }
      }
    });
    
    console.log(`🔄 REMOVE STAFF: Completed removal of ${staffName} from week ${currentWeekMonday}`);
  }, [currentWeekState.dates, shiftData, setShiftData, updateDebugVariables]);

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

  // Update all debug variables
  useEffect(() => {
    const formattedShiftData = formatShiftDataForDebug();
    
    // Get current week's Monday date for filtering
    const currentWeekMonday = currentWeekState.dates[0];
    
    // Count staff in the current week (excluding header and Add Staff rows)
    const currentWeekStaffCount = rows.filter(row => 
      row.id !== 'row-1' && row.id !== 'row-2'
    ).length;
    
    // Get actual shifts for this week by filtering the shift data object
    const shiftsForCurrentWeek = Object.keys(shiftData || {})
      .filter(key => {
        // Key format is: staffName_day_weekStartDate
        // We need to check if it has the current week's Monday date at the end
        const parts = key.split('_');
        return parts.length >= 3 && parts[parts.length - 1] === currentWeekMonday;
      });
      
    const actualShiftCount = shiftsForCurrentWeek.length;
    
    // Debug logging to verify counts
    console.log('DETAILED DEBUG COUNTS:', {
      week: currentWeekMonday,
      staffCount: currentWeekStaffCount,
      actualShiftCount,
      shifts: shiftsForCurrentWeek
    });
    
    // Update debug variables with ALL information
    updateDebugVariables({
      ShiftTable: {
        currentWeek: {
          weekOffset,
          startDate: currentWeekMonday,
          allDates: currentWeekState.dates,
          lastUpdated: new Date().toISOString()
        },
        dataStats: {
          rowCount: rows.length,
          shiftCount: actualShiftCount,
          staffCount: currentWeekStaffCount
        },
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
    rows,
    numColumns,
    getFrozenRowCount,
    getFrozenColumnCount,
    isStaffSelectorOpen,
    notification,
    formatShiftDataForDebug,
    shiftData
  ]);

  // IMPORTANT: Debug logging for staff management
  useEffect(() => {
    try {
      const globalStaffList = JSON.parse(localStorage.getItem('shiftTableStaff') || '[]');
      const staffByWeek = JSON.parse(localStorage.getItem('shiftTableStaffByWeek') || '{}');
      const currentWeekMonday = currentWeekState.dates[0];
      
      // Log staff management info
      console.log('DEBUG: Staff Management', {
        currentWeek: currentWeekMonday,
        globalStaffList,
        weeklyStaff: staffByWeek[currentWeekMonday] || [],
        allWeeks: Object.keys(staffByWeek)
      });
    } catch (error) {
      console.error('Error debugging staff management:', error);
    }
  }, [currentWeekState.dates, renderKey]);

  // DEBUG: Log the currentStaffIds being passed to StaffSelector
  // This will help us understand what's being filtered
  useEffect(() => {
    console.log('DEBUG: currentStaffIds passed to StaffSelector:', currentStaffIds);
    
    // Also check what staff is in the table
    const staffInTable = rows
      .filter(row => row.id !== 'row-1' && row.id !== 'row-2')
      .map(row => row.cells[0]);
    
    console.log('DEBUG: Staff in table rows:', staffInTable);
    
    // Check staff who already have shifts
    const currentWeekMonday = currentWeekState.dates[0];
    const staffWithShifts = Object.keys(shiftData)
      .filter(key => key.includes(currentWeekMonday))
      .map(key => key.split('_')[0]);
    
    console.log('DEBUG: Staff with shifts:', staffWithShifts);
  }, [currentStaffIds, rows, shiftData, currentWeekState.dates]);

  // Render a cell based on its content and position
  const renderCell = useCallback((cell, rowIndex, colIndex) => {
    const row = rows[rowIndex];
    const isFirstRow = rowIndex === 0;
    const isFirstCol = colIndex === 0;
    const isAddStaffRow = row.id === 'row-2';
    
    // Get the current week's Monday date for week-specific data
    const currentWeekMonday = currentWeekState.dates[0];
    
    return (
      <td
        key={`${row.id}-cell-${colIndex}`}
        data-col-index={colIndex}
        className={`border p-2 ${colIndex === 0 ? 'min-w-[140px] w-[140px]' : (!isFirstRow && colIndex > 0) ? 'min-w-[180px] w-[180px]' : ''}`}
      >
        {isAddStaffRow && colIndex === 0 ? (
          <AddStaffButton onClick={handleAddStaffClick} />
        ) : isFirstRow || colIndex === 0 ? (
          cell
        ) : (!isFirstRow && !isAddStaffRow) ? (
          <ShiftSlot
            staffName={rows[rowIndex].cells[0]}
            day={rows[0].cells[colIndex].split('\n')[0].toLowerCase()} // Get day name from header and make lowercase for consistency
            rowId={row.id}
            colIndex={colIndex}
            onShiftChange={handleShiftChange}
            shiftData={(() => {
              // Get the staff name and day for this cell
              const staffName = rows[rowIndex].cells[0];
              const dayName = rows[0].cells[colIndex].split('\n')[0].toLowerCase();
              
              // Create the week-specific key to look up shift data
              const shiftKey = `${staffName}_${dayName}_${currentWeekMonday}`;
              return shiftData?.[shiftKey] || {};
            })()}
            weekStartDate={currentWeekMonday}
            key={`shift-${rows[rowIndex].cells[0]}-${rows[0].cells[colIndex].split('\n')[0].toLowerCase()}-${currentWeekMonday}-${renderKey}`}
          />
        ) : (
          cell
        )}
      </td>
    );
  }, [rows, handleAddStaffClick, handleShiftChange, shiftData, currentWeekState.dates, renderKey]);

  // State for shift editor
  const [isShiftEditorOpen, setShiftEditorOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);

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
          onClick={handleCurrentWeek}
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
                  {row.cells.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))}
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
                      <RemoveButton onRemove={() => handleRemoveStaff(row.id, rows[rowIndex].cells[0])} />
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
        currentStaffIds={staffNamesInTable}
      />
      
      {/* Shift Editor */}
      {isShiftEditorOpen && editingShift && (
        <ShiftEditor
          staffName={editingShift.staffName}
          day={editingShift.day}
          startTime={editingShift.startTime}
          endTime={editingShift.endTime}
          weekStartDate={editingShift.weekStartDate}
          onSave={handleShiftSave}
          onCancel={() => {
            setShiftEditorOpen(false);
            setEditingShift(null);
          }}
        />
      )}
    </div>
  );
}

export default ShiftTable;
