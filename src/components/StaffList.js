// This component manages the staff list display and interactions
import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useDebug } from './Debug/DebugContext';
import { useStaffNumber } from '../context/StaffContext';
import { useStaffDetail } from '../context/StaffDetailContext';
import AddButton from './AddButton';
import RemoveButton from './RemoveButton';
import Availability from './Availability';
import StaffRow from './StaffRow';

function StaffList() {
  const { updateDebugVariables } = useDebug();
  const { staffNumber, updateStaffNumber } = useStaffNumber();
  const { addStaffMember, removeStaffMember, updateStaffMember, updateStaffAvailability, getStaffMember } = useStaffDetail();
  const tableRef = useRef(null);

  // Validate if input contains only letters and spaces
  const isValidName = useCallback((value) => {
    return value && /^[A-Za-z\s]+$/.test(value.trim());
  }, []);

  // Track table dimensions and editing state
  const [dimensions, setDimensions] = useState({
    rowCount: 0,
    columnCount: 0
  });
  const [editingStaffId, setEditingStaffId] = useState(null);  // Track which staff is being edited
  const [editingValues, setEditingValues] = useState(null);    // Track temporary edit values
  const [rows, setRows] = useState([
    Array(5).fill('') // Keep one empty row for input
  ]);
  const [clickedRows, setClickedRows] = useState(new Set());
  const [inputValues, setInputValues] = useState({});
  const [roleValues, setRoleValues] = useState({});
  const [commentValues, setCommentValues] = useState({});
  const [availabilityValues, setAvailabilityValues] = useState({});
  const [rowStaffIDs, setRowStaffIDs] = useState({});
  const [storedStaff, setStoredStaff] = useState({}); // Track all staff data locally

  // Initialize from loaded data
  useEffect(() => {
    const initializeFromLoadedData = () => {
      const staffMembers = getStaffMember();
      console.log('Initializing from staff members:', staffMembers); // Debug log

      if (staffMembers && Array.isArray(staffMembers) && staffMembers.length > 0) {
        const activeStaff = staffMembers.filter(staff => staff.inList && staff.state === 'SAVED');
        console.log('Active staff members:', activeStaff); // Debug log

        if (activeStaff.length > 0) {
          // Create rows including one empty row at the end
          const totalRows = activeStaff.length + 1;
          setRows(new Array(totalRows).fill(null).map(() => Array(5).fill('')));

          // Initialize mappings
          const mappings = activeStaff.reduce((acc, staff, index) => {
            acc.rowStaffIDs[index] = staff.staffID;
            acc.inputValues[index] = staff.fullName || '';
            acc.roleValues[index] = staff.role || '';
            acc.commentValues[index] = staff.comments || '';
            acc.availabilityValues[index] = staff.availability || [];
            return acc;
          }, {
            rowStaffIDs: {},
            inputValues: {},
            roleValues: {},
            commentValues: {},
            availabilityValues: {}
          });

          // Update all state at once
          setRowStaffIDs(mappings.rowStaffIDs);
          setInputValues(mappings.inputValues);
          setRoleValues(mappings.roleValues);
          setCommentValues(mappings.commentValues);
          setAvailabilityValues(mappings.availabilityValues);
          
          // Update staff count
          updateStaffNumber(activeStaff.length);
        }
      }
    };

    initializeFromLoadedData();
  }, [getStaffMember, updateStaffNumber]);

  // Update debug variables and sync with StaffDetailContext
  useEffect(() => {
    // Get current staff data
    const staffData = {};
    Object.entries(rowStaffIDs).forEach(([rowIndex, staffId]) => {
      const staff = getStaffMember(staffId);
      if (staff) {
        staffData[staffId] = staff;
      }
    });

    // Prepare current input row data
    const currentInputRow = {
      fullName: inputValues[0] || '',
      role: roleValues[0] || '',
      comments: commentValues[0] || '',
      availability: availabilityValues[0] || []
    };

    // Update debug variables with all state
    updateDebugVariables({
      StaffList: {
        dimensions: {
          value: dimensions,
          type: 'object',
          lastUpdated: new Date().toLocaleTimeString()
        },
        buttonCounts: {
          value: {
            addButtons: rows.reduce((count, _, rowIndex) => 
              !rowStaffIDs[rowIndex] && inputValues[rowIndex] ? count + 1 : count
            , 0),
            removeButtons: Object.values(rowStaffIDs).filter(id => id).length,
            disabledButtons: rows.reduce((count, _, rowIndex) => 
              !rowStaffIDs[rowIndex] && inputValues[rowIndex] && !isValidName(inputValues[rowIndex]) ? count + 1 : count
            , 0)
          },
          type: 'object',
          lastUpdated: new Date().toLocaleTimeString()
        },
        LocalStorage: {
          value: {
            currentInput: currentInputRow,
            staffMembers: staffData,
            staffCount: Object.keys(staffData).length,
            rowMapping: {
              rowStaffIDs: rowStaffIDs,
              inputValues: inputValues,
              roleValues: roleValues,
              commentValues: commentValues,
              availabilityValues: availabilityValues
            }
          },
          type: 'object',
          lastUpdated: new Date().toLocaleTimeString()
        },
        storedData: {
          value: JSON.parse(localStorage.getItem('staff_list_data') || '{}'),
          type: 'object',
          description: 'Raw data from localStorage'
        }
      }
    });
  }, [
    dimensions,
    inputValues,
    roleValues,
    commentValues,
    availabilityValues,
    rowStaffIDs,
    rows,
    getStaffMember,
    isValidName,
    updateDebugVariables
  ]);

  // Generate unique staffID
  const generateStaffID = useCallback(() => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `staff_${timestamp}${random}`;
  }, []);

  // Start editing a staff member
  const handleEdit = useCallback((staffId) => {
    const staff = getStaffMember(staffId);
    if (staff) {
      setEditingStaffId(staffId);
      setEditingValues({ ...staff }); // Make a copy for editing
    }
  }, [getStaffMember]);

  // Handle changes during edit
  const handleEditChange = useCallback((field, value) => {
    setEditingValues(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Save edited staff member
  const handleSave = useCallback(() => {
    if (editingStaffId && editingValues) {
      updateStaffMember(editingStaffId, editingValues);
      setEditingStaffId(null);
      setEditingValues(null);
    }
  }, [editingStaffId, editingValues, updateStaffMember]);

  // Cancel editing
  const handleCancel = useCallback(() => {
    setEditingStaffId(null);
    setEditingValues(null);
  }, []);

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
  const handleAddClick = useCallback((rowIndex) => {
    if (!isValidName(inputValues[rowIndex])) return;

    const staffID = generateStaffID();
    const newStaff = {
      staffID,
      fullName: inputValues[rowIndex],
      role: roleValues[rowIndex] || '',
      comments: commentValues[rowIndex] || '',
      availability: availabilityValues[rowIndex] || []
    };

    addStaffMember(newStaff);
    setRowStaffIDs(prev => ({ ...prev, [rowIndex]: staffID }));
    
    // Keep the input values in state but mark the row as having a staff member
    setInputValues(prev => ({ ...prev }));
    setRoleValues(prev => ({ ...prev }));
    setCommentValues(prev => ({ ...prev }));
    setAvailabilityValues(prev => ({ ...prev }));

    // Update staff count
    updateStaffNumber(prev => prev + 1);
  }, [inputValues, roleValues, commentValues, availabilityValues, addStaffMember, updateStaffNumber, isValidName, generateStaffID]);

  const handleRemoveClick = useCallback((rowIndex) => {
    const staffID = rowStaffIDs[rowIndex];
    if (staffID) {
      removeStaffMember(staffID);
      
      // Remove the row and shift remaining rows up
      setRows(prev => {
        const newRows = [...prev];
        newRows.splice(rowIndex, 1);
        return newRows;
      });

      // Update staff IDs and values
      setRowStaffIDs(prev => {
        const newRowStaffIDs = {};
        Object.entries(prev).forEach(([key, value]) => {
          const keyNum = parseInt(key);
          if (keyNum < rowIndex) {
            newRowStaffIDs[keyNum] = value;
          } else if (keyNum > rowIndex) {
            newRowStaffIDs[keyNum - 1] = value;
          }
        });
        return newRowStaffIDs;
      });

      // Update all row-based values
      const updateRowValues = (setter) => {
        setter(prev => {
          const newValues = {};
          Object.entries(prev).forEach(([key, value]) => {
            const keyNum = parseInt(key);
            if (keyNum < rowIndex) {
              newValues[keyNum] = value;
            } else if (keyNum > rowIndex) {
              newValues[keyNum - 1] = value;
            }
          });
          return newValues;
        });
      };

      updateRowValues(setInputValues);
      updateRowValues(setRoleValues);
      updateRowValues(setCommentValues);
      updateRowValues(setAvailabilityValues);

      // Update staff count
      updateStaffNumber(prev => prev - 1);
    }
  }, [rowStaffIDs, removeStaffMember, updateStaffNumber]);

  // Handle input changes
  const handleInputChange = useCallback((rowIndex, value) => {
    setInputValues(prev => ({
      ...prev,
      [rowIndex]: value
    }));
  }, []);

  // Handle role changes
  const handleRoleChange = useCallback((rowIndex, value) => {
    setRoleValues(prev => ({
      ...prev,
      [rowIndex]: value
    }));
  }, []);

  // Handle comment changes
  const handleCommentChange = useCallback((rowIndex, value) => {
    setCommentValues(prev => ({
      ...prev,
      [rowIndex]: value
    }));
  }, []);

  // Handle availability changes
  const handleAvailabilityChange = useCallback((rowIndex, days) => {
    setAvailabilityValues(prev => ({
      ...prev,
      [rowIndex]: days
    }));
  }, []);

  const headerLabels = ['STAFF', 'ROLE', 'COMMENTS', 'AVAILABILITY', ''];

  return (
    <div style={{ width: '100%' }}>
      <table ref={tableRef} style={{ width: '100%' }}>
        <thead>
          <tr>
            {headerLabels.map((label, index) => (
              <th key={index}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((_, rowIndex) => {
            const staffId = rowStaffIDs[rowIndex];
            return (
              <tr key={rowIndex}>
                <td>
                  <input
                    type="text"
                    value={inputValues[rowIndex] || ''}
                    onChange={(e) => handleInputChange(rowIndex, e.target.value)}
                    placeholder="Name e.g. John"
                    style={{ width: '100%', padding: '4px', border: '1px solid #ccc' }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={roleValues[rowIndex] || ''}
                    onChange={(e) => handleRoleChange(rowIndex, e.target.value)}
                    placeholder="Role e.g. Bar Tender"
                    style={{ width: '100%', padding: '4px', border: '1px solid #ccc' }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={commentValues[rowIndex] || ''}
                    onChange={(e) => handleCommentChange(rowIndex, e.target.value)}
                    placeholder="Comments e.g. New"
                    style={{ width: '100%', padding: '4px', border: '1px solid #ccc' }}
                  />
                </td>
                <td>
                  <Availability
                    rowIndex={rowIndex}
                    value={availabilityValues[rowIndex] || []}
                    onChange={handleAvailabilityChange}
                  />
                </td>
                <td>
                  {staffId ? (
                    <RemoveButton onClick={() => handleRemoveClick(rowIndex)} />
                  ) : inputValues[rowIndex] && !rowStaffIDs[rowIndex] ? (
                    <AddButton
                      onAdd={() => handleAddClick(rowIndex)}
                      disabled={!isValidName(inputValues[rowIndex])}
                    />
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default StaffList;
