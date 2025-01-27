// This component manages the staff list display and interactions
import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useDebug } from './Debug/DebugContext';
import { useStaffNumber } from '../context/StaffContext';
import { useStaffDetail } from '../context/StaffDetailContext';
import AddButton from './AddButton';
import RemoveButton from './RemoveButton';
import Notification from './Notification';

function StaffList() {
  const { updateDebugVariables } = useDebug();
  const { staffNumber, updateStaffNumber } = useStaffNumber();
  const { addStaffMember, removeStaffMember } = useStaffDetail();
  const tableRef = useRef(null);
  
  // Track table dimensions, button clicks, and frozen rows
  const [dimensions, setDimensions] = useState({
    rowCount: 0,
    columnCount: 0
  });
  const [addButtonClicks, setAddButtonClicks] = useState(0); // Track Add button clicks
  const [frozenRowCount, setFrozenRowCount] = useState(1); // Track frozen rows
  const [addButtonCount, setAddButtonCount] = useState(0); // Track actual number of Add buttons
  const [rows, setRows] = useState([
    Array(5).fill('') // Single data row
  ]);
  const [clickedRows, setClickedRows] = useState(new Set());
  const [inputValues, setInputValues] = useState({});
  const [roleValues, setRoleValues] = useState({});
  const [commentValues, setCommentValues] = useState({});
  const [showNotification, setShowNotification] = useState(false);
  const [notificationShows, setNotificationShows] = useState(0);
  const [rowStaffIDs, setRowStaffIDs] = useState({});

  const headerLabels = ['STAFF', 'ROLE', 'COMMENTS', 'AVAILABILITY', ''];

  // Validate if input contains only letters and spaces
  const isValidName = useCallback((value) => {
    return value && /^[A-Za-z\s]+$/.test(value.trim());
  }, []);

  // Generate unique staffID
  const generateStaffID = useCallback(() => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `staff_${timestamp}${random}`;
  }, []);

  // Calculate current dimensions and button count
  const updateDimensions = useCallback(() => {
    if (tableRef.current) {
      const rows = tableRef.current.getElementsByTagName('tr');
      const rowCount = rows.length;
      const columnCount = rows[0]?.cells.length || 0;
      const buttons = Array.from(tableRef.current.getElementsByTagName('button'));
      
      // Count Add buttons
      let addCount = 0;
      buttons.forEach(button => {
        if (button.textContent.trim() === 'Add') {
          addCount++;
        }
      });
      
      setDimensions({
        rowCount,
        columnCount
      });
      setAddButtonCount(addCount);
    }
  }, []);

  // Handle Add button click
  const handleAddClick = useCallback((rowIndex) => {
    const inputValue = inputValues[rowIndex];
    if (!isValidName(inputValue)) {
      setShowNotification(true);
      return; // Don't proceed if input is invalid
    }

    setAddButtonClicks(prev => prev + 1);
    setClickedRows(prev => new Set([...prev, rowIndex]));
    
    // Create new staff member with unique ID
    const newStaffID = generateStaffID();
    addStaffMember({
      staffID: newStaffID,
      fullName: inputValue.trim(),
      role: roleValues[rowIndex] || '',
      comments: commentValues[rowIndex] || '',
      availability: []
    });

    // Store staffID for this row
    setRowStaffIDs(prev => ({
      ...prev,
      [rowIndex]: newStaffID
    }));

    // Update staff number
    updateStaffNumber(staffNumber + 1);

    // Add new row to table
    setRows(prev => [
      ...prev,
      Array(5).fill('') // Add new row
    ]);
  }, [addStaffMember, generateStaffID, inputValues, roleValues, commentValues, isValidName, staffNumber, updateStaffNumber]);

  // Handle Remove button click
  const handleRemoveClick = useCallback((rowIndex) => {
    // Get staffID for this row
    const staffID = rowStaffIDs[rowIndex];
    if (!staffID) return;

    // Remove staff member from context
    removeStaffMember(staffID);

    // Update staff number
    updateStaffNumber(staffNumber - 1);

    // Remove row from table
    setRows(prev => prev.filter((_, index) => index !== rowIndex));
    
    // Clean up row data
    setClickedRows(prev => {
      const newSet = new Set(prev);
      newSet.delete(rowIndex);
      return newSet;
    });
    setInputValues(prev => {
      const newValues = { ...prev };
      delete newValues[rowIndex];
      return newValues;
    });
    setRoleValues(prev => {
      const newValues = { ...prev };
      delete newValues[rowIndex];
      return newValues;
    });
    setCommentValues(prev => {
      const newValues = { ...prev };
      delete newValues[rowIndex];
      return newValues;
    });
    setRowStaffIDs(prev => {
      const newIDs = { ...prev };
      delete newIDs[rowIndex];
      return newIDs;
    });
  }, [removeStaffMember, rowStaffIDs, staffNumber, updateStaffNumber]);

  // Handle input changes
  const handleInputChange = useCallback((rowIndex, value) => {
    setInputValues(prev => ({
      ...prev,
      [rowIndex]: value
    }));
  }, []);

  const handleRoleChange = useCallback((rowIndex, value) => {
    setRoleValues(prev => ({
      ...prev,
      [rowIndex]: value
    }));
  }, []);

  const handleCommentChange = useCallback((rowIndex, value) => {
    setCommentValues(prev => ({
      ...prev,
      [rowIndex]: value
    }));
  }, []);

  // Update dimensions after render and when table changes
  useEffect(() => {
    updateDimensions();
  }, [updateDimensions, rows]);

  // Update debug display with table dimensions and click count
  const updateDebug = useCallback(() => {
    updateDebugVariables({
      StaffList: {
        rowCount: {
          value: dimensions.rowCount,
          lastUpdated: new Date().toLocaleTimeString(),
          type: "number"
        },
        columnCount: {
          value: dimensions.columnCount,
          lastUpdated: new Date().toLocaleTimeString(),
          type: "number"
        },
        addButtonClicks: {
          value: addButtonClicks,
          lastUpdated: new Date().toLocaleTimeString(),
          type: "number"
        },
        staffNumber: {
          value: staffNumber,
          lastUpdated: new Date().toLocaleTimeString(),
          type: "number"
        },
        frozenRowCount: {
          value: frozenRowCount,
          lastUpdated: new Date().toLocaleTimeString(),
          type: "number"
        },
        addButtonCount: {
          value: addButtonCount,
          lastUpdated: new Date().toLocaleTimeString(),
          type: "number"
        }
      }
    });
  }, [dimensions, addButtonClicks, staffNumber, frozenRowCount, addButtonCount, updateDebugVariables]);

  // Update debug whenever dimensions or click count changes
  useEffect(() => {
    updateDebug();
  }, [updateDebug]);

  // Track actual input fields and comments
  useEffect(() => {
    const activeInputFields = rows.length - clickedRows.size;
    updateDebugVariables({
      StaffList: {
        inputFields: {
          value: activeInputFields,
          type: "number",
          description: "Number of active input fields"
        },
        totalRows: {
          value: rows.length,
          type: "number",
          description: "Total number of rows"
        },
        clickedRows: {
          value: clickedRows.size,
          type: "number",
          description: "Number of rows with confirmed staff names"
        },
        comments: {
          value: Object.entries(commentValues).map(([rowIndex, comment]) => ({
            rowIndex: parseInt(rowIndex),
            comment: comment || 'No comment'
          })),
          type: "array",
          description: "Comments for each row"
        }
      }
    });
  }, [rows.length, clickedRows.size, commentValues, updateDebugVariables]);

  // Track notification metrics
  useEffect(() => {
    if (showNotification) {
      setNotificationShows(prev => prev + 1);
    }
  }, [showNotification]);

  // Update debug variables with notification metrics
  useEffect(() => {
    updateDebugVariables({
      Notification: {
        shows: {
          value: notificationShows,
          type: "number",
          description: "Number of times notification has been shown"
        },
        width: {
          value: "20rem",
          type: "string",
          description: "Width of notification"
        },
        zIndex: {
          value: 50,
          type: "number",
          description: "Z-index of notification"
        }
      }
    });
  }, [notificationShows, updateDebugVariables]);

  return (
    <div className="w-full h-[calc(100vh-theme(spacing.32))] flex flex-col">
      <div className="flex-1 overflow-auto">
        <table ref={tableRef} className="min-w-full border-collapse">
          <thead>
            <tr>
              {headerLabels.map((label, index) => (
                <th 
                  key={index}
                  className="border p-2 sticky top-0 bg-white z-10 font-semibold text-left"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td 
                    key={cellIndex} 
                    className="border p-2"
                  >
                    {cellIndex === 0 && (
                      <>
                        {!clickedRows.has(rowIndex) ? (
                          <input
                            type="text"
                            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Name e.g. John Doe"
                            value={inputValues[rowIndex] || ''}
                            onChange={(e) => handleInputChange(rowIndex, e.target.value)}
                          />
                        ) : (
                          <span className="text-gray-900">
                            {inputValues[rowIndex] || ''}
                          </span>
                        )}
                      </>
                    )}
                    {cellIndex === 1 && (
                      <>
                        {!clickedRows.has(rowIndex) ? (
                          <input
                            type="text"
                            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Role e.g. Bar Tender"
                            value={roleValues[rowIndex] || ''}
                            onChange={(e) => handleRoleChange(rowIndex, e.target.value)}
                          />
                        ) : (
                          <span className="text-gray-900">
                            {roleValues[rowIndex] || ''}
                          </span>
                        )}
                      </>
                    )}
                    {cellIndex === 2 && (
                      <>
                        {!clickedRows.has(rowIndex) ? (
                          <input
                            type="text"
                            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Comments e.g. New"
                            value={commentValues[rowIndex] || ''}
                            onChange={(e) => handleCommentChange(rowIndex, e.target.value)}
                          />
                        ) : (
                          <span className="text-gray-900">
                            {commentValues[rowIndex] || ''}
                          </span>
                        )}
                      </>
                    )}
                    {cellIndex === row.length - 1 && (
                      <>
                        {!clickedRows.has(rowIndex) ? (
                          <AddButton 
                            onAdd={() => handleAddClick(rowIndex)}
                          />
                        ) : (
                          <RemoveButton 
                            onRemove={() => handleRemoveClick(rowIndex)}
                          />
                        )}
                      </>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Notification 
        show={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </div>
  );
}

export default StaffList;
