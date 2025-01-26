// This component manages the staff list display and interactions
import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useDebug } from './Debug/DebugContext';
import { useStaffNumber } from '../context/StaffContext';
import AddButton from './AddButton';

function StaffList() {
  const { updateDebugVariables } = useDebug();
  const { staffNumber } = useStaffNumber();
  const tableRef = useRef(null);
  
  // Track table dimensions, button clicks, and frozen rows
  const [dimensions, setDimensions] = useState({
    rowCount: 0,
    columnCount: 0
  });
  const [addButtonClicks, setAddButtonClicks] = useState(0);
  const [removeButtonClicks, setRemoveButtonClicks] = useState(0); // Track remove button clicks
  const [frozenRowCount, setFrozenRowCount] = useState(1); // Track frozen rows
  const [addButtonCount, setAddButtonCount] = useState(0); // Track actual number of Add buttons
  const [rows, setRows] = useState([
    Array(5).fill('') // Single data row
  ]);

  const headerLabels = ['STAFF', 'ROLE', 'COMMENTS', 'AVAILABILITY', ''];

  // Calculate current dimensions and button count
  const updateDimensions = useCallback(() => {
    if (tableRef.current) {
      const rows = tableRef.current.getElementsByTagName('tr');
      const rowCount = rows.length;
      const columnCount = rows[0]?.cells.length || 0;
      const buttons = tableRef.current.getElementsByTagName('button');
      const buttonCount = buttons.length;
      
      setDimensions({
        rowCount,
        columnCount
      });
      setAddButtonCount(buttonCount);
    }
  }, []);

  // Handle Add button click
  const handleAddClick = useCallback(() => {
    setAddButtonClicks(prev => prev + 1);
    setRows(prev => [
      ...prev,
      Array(5).fill('') // Add new row
    ]);
  }, []);

  // Handle Remove button click
  const handleRemoveClick = useCallback((rowIndex) => {
    setRemoveButtonClicks(prev => prev + 1); // Increment remove clicks
    setRows(prev => prev.filter((_, index) => index !== rowIndex));
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
        removeButtonClicks: {
          value: removeButtonClicks,
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
  }, [dimensions, addButtonClicks, removeButtonClicks, staffNumber, frozenRowCount, addButtonCount, updateDebugVariables]);

  // Update debug whenever dimensions or click count changes
  useEffect(() => {
    updateDebug();
  }, [updateDebug]);

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
                    {cellIndex === row.length - 1 && (
                      <AddButton 
                        onAdd={handleAddClick}
                        onRemove={() => handleRemoveClick(rowIndex)}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StaffList;
