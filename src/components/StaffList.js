// This component manages the staff list display and interactions
import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useDebug } from './Debug/DebugContext';

function StaffList() {
  const { updateDebugVariables } = useDebug();
  const tableRef = useRef(null);
  
  // Track table dimensions, button clicks, and rows
  const [dimensions, setDimensions] = useState({
    rowCount: 0,
    columnCount: 0
  });
  const [addButtonClicks, setAddButtonClicks] = useState(0);
  const [rows, setRows] = useState([
    Array(5).fill(''), // First row
    Array(5).fill('')  // Button row
  ]);

  // Calculate current dimensions
  const updateDimensions = useCallback(() => {
    if (tableRef.current) {
      const rows = tableRef.current.getElementsByTagName('tr');
      const rowCount = rows.length;
      const columnCount = rows[0]?.cells.length || 0;
      
      setDimensions({
        rowCount,
        columnCount
      });
    }
  }, []);

  // Handle Add button click
  const handleAddClick = useCallback(() => {
    setAddButtonClicks(prev => prev + 1);
    // Insert new row before the button row
    setRows(prev => [
      ...prev.slice(0, -1), // All rows except button row
      Array(5).fill(''),    // New row
      prev[prev.length - 1] // Button row
    ]);
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
        }
      }
    });
  }, [dimensions, addButtonClicks, updateDebugVariables]);

  // Update debug whenever dimensions or click count changes
  useEffect(() => {
    updateDebug();
  }, [updateDebug]);

  return (
    <div className="w-full overflow-x-auto">
      <table ref={tableRef} className="min-w-full border-collapse">
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="border p-2">
                  {rowIndex === rows.length - 1 && cellIndex === 0 && (
                    <button onClick={handleAddClick}>Add</button>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StaffList;
