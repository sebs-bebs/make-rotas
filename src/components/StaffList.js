// This component manages the staff list display and interactions
import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useDebug } from './Debug/DebugContext';
import { useStaffNumber } from '../context/StaffContext';
import { useStaffDetail } from '../context/StaffDetailContext';
import AddButton from './AddButton';
import RemoveButton from './RemoveButton';
import EditButton from './EditButton';
import Availability from './Availability';
import StaffRow from './StaffRow';
import Notification from './Notification';
import SkeletonLoader from './SkeletonLoader';

function StaffList() {
  const { updateDebugVariables } = useDebug();
  const { staffNumber, updateStaffNumber } = useStaffNumber();
  const { addStaffMember, removeStaffMember, updateStaffMember, updateStaffAvailability, getStaffMember } = useStaffDetail();
  const tableRef = useRef(null);
  const tableContainerRef = useRef(null);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Virtualized rendering state
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);
  const [visibleRowCount, setVisibleRowCount] = useState(20); // Show 20 rows at a time
  const [totalHeight, setTotalHeight] = useState(0);
  const rowHeight = 52; // Approximate height of each row in pixels

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
  const [editingRow, setEditingRow] = useState(null);
  const [editingValues, setEditingValues] = useState({});    // Track temporary edit values
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

  // Add notification state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationDescription, setNotificationDescription] = useState('');

  // Initialize from loaded data
  useEffect(() => {
    setIsLoading(true);
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
      // Simulate loading delay when there are many staff members (in real app, this would be real loading time)
      const delay = (staffMembers && staffMembers.length > 30) ? 800 : 300;
      setTimeout(() => setIsLoading(false), delay);
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
        activeStaff: {
          value: Object.entries(rowStaffIDs).map(([rowIndex, staffId]) => ({
            name: inputValues[rowIndex] || 'Unnamed',
            role: roleValues[rowIndex] || 'No Role',
            isEditing: editingRow === parseInt(rowIndex)
          })),
          type: 'array',
          description: 'Currently active staff members'
        },
        buttons: {
          value: {
            addButton: rows.reduce((count, _, rowIndex) => 
              !rowStaffIDs[rowIndex] && inputValues[rowIndex] ? count + 1 : count
            , 0),
            removeButton: Object.values(rowStaffIDs).filter(id => id).length,
            editButton: Object.values(rowStaffIDs).filter(id => id).length,
            disabledAdd: rows.reduce((count, _, rowIndex) => 
              !rowStaffIDs[rowIndex] && inputValues[rowIndex] && !isValidName(inputValues[rowIndex]) ? count + 1 : count
            , 0)
          },
          type: 'object',
          description: 'Button states in the staff list'
        },
        editingState: {
          value: {
            isEditing: editingRow !== null,
            editingStaffName: editingRow !== null ? inputValues[editingRow] : null,
            editingValues: editingValues
          },
          type: 'object',
          description: 'Current editing state'
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
    editingRow,
    editingValues,
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
    const staffID = generateStaffID();
    const newStaff = {
      staffID,
      fullName: inputValues[rowIndex],
      role: roleValues[rowIndex] || '',
      comments: commentValues[rowIndex] || '',
      availability: availabilityValues[rowIndex] || [],
      inList: true,
      state: 'SAVED'
    };

    // Add to context
    addStaffMember(newStaff);

    // Update row mapping
    setRowStaffIDs(prev => ({
      ...prev,
      [rowIndex]: staffID
    }));

    // Clear input row and add new empty row
    setRows(prev => [...prev.slice(0, -1), Array(5).fill('')]);
    
    // Update debug variables
    updateDebugVariables('staffMembers', {
      [staffID]: {
        ...newStaff
      }
    });
  }, [generateStaffID, inputValues, roleValues, commentValues, availabilityValues, addStaffMember, updateDebugVariables]);

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
    const staffId = rowStaffIDs[rowIndex];
    setAvailabilityValues(prev => ({
      ...prev,
      [rowIndex]: days
    }));

    if (staffId) {
      const staff = getStaffMember(staffId);
      if (staff) {
        const updatedStaff = {
          ...staff,
          availability: days
        };
        updateStaffMember(staffId, updatedStaff);
      }
    }
  }, [rowStaffIDs, getStaffMember, updateStaffMember]);

  // Handle edit button click
  const handleEditClick = useCallback((rowIndex) => {
    // Store current values for editing
    setEditingRow(rowIndex);
    setEditingValues({
      name: inputValues[rowIndex] || '',
      role: roleValues[rowIndex] || '',
      comments: commentValues[rowIndex] || '',
      availability: availabilityValues[rowIndex] || []
    });
  }, [inputValues, roleValues, commentValues, availabilityValues]);

  // Handle save after editing
  const handleSaveClick = useCallback((rowIndex) => {
    const staffId = rowStaffIDs[rowIndex];
    if (!staffId) return;

    // Validate the edited name
    if (!isValidName(editingValues.name)) {
      setNotificationMessage('Please Check Staff Name');
      setNotificationDescription('Staff names should only include letters and spaces. For example: "John Smith"');
      setShowNotification(true);
      return;
    }

    // Update all values
    setInputValues(prev => ({
      ...prev,
      [rowIndex]: editingValues.name
    }));
    setRoleValues(prev => ({
      ...prev,
      [rowIndex]: editingValues.role
    }));
    setCommentValues(prev => ({
      ...prev,
      [rowIndex]: editingValues.comments
    }));
    setAvailabilityValues(prev => ({
      ...prev,
      [rowIndex]: editingValues.availability
    }));

    // Update staff member in context
    const updatedStaff = {
      staffID: staffId,
      fullName: editingValues.name,
      role: editingValues.role || '',
      comments: editingValues.comments || '',
      availability: editingValues.availability || [],
      inList: true,
      state: 'SAVED'
    };
    updateStaffMember(staffId, updatedStaff);

    // Update debug variables
    updateDebugVariables('staffMembers', {
      [staffId]: updatedStaff
    });

    // Clear editing state
    setEditingRow(null);
    setEditingValues({});
  }, [editingValues, isValidName, rowStaffIDs, updateStaffMember, updateDebugVariables]);

  // Handle cancel editing
  const handleCancelEdit = useCallback(() => {
    setEditingRow(null);
    setEditingValues({});
  }, []);

  // Handle scroll events for virtualization
  const handleScroll = useCallback(() => {
    if (tableContainerRef.current) {
      const scrollTop = tableContainerRef.current.scrollTop;
      const newStartIndex = Math.max(0, Math.floor(scrollTop / rowHeight));
      setVisibleStartIndex(newStartIndex);
    }
  }, [rowHeight]);

  // Setup scroll event listener
  useEffect(() => {
    const containerRef = tableContainerRef.current;
    if (containerRef) {
      containerRef.addEventListener('scroll', handleScroll);
      return () => {
        containerRef.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);

  // Calculate total height and row count for virtualization
  useEffect(() => {
    setTotalHeight(rows.length * rowHeight);
    // Update visible row count based on container height
    if (tableContainerRef.current) {
      const containerHeight = tableContainerRef.current.clientHeight;
      const visibleRows = Math.ceil(containerHeight / rowHeight) + 2; // Add buffer
      setVisibleRowCount(visibleRows);
    }
  }, [rows.length, rowHeight]);

  // Memoize the rows that should be rendered
  const visibleRows = useCallback(() => {
    // Add empty input row at the end
    const endIndex = Math.min(visibleStartIndex + visibleRowCount, rows.length);
    return [...Array(endIndex - visibleStartIndex).keys()]
      .map(i => i + visibleStartIndex);
  }, [visibleStartIndex, visibleRowCount, rows.length]);

  const headerLabels = ['STAFF', 'ROLE', 'COMMENTS', 'AVAILABILITY', ''];

  // Render skeleton loader during loading
  if (isLoading) {
    return (
      <div style={{ width: '100%' }}>
        <div className="overflow-y-auto" style={{ maxHeight: '35rem' }}>
          <table style={{ width: '100%' }}>
            <thead className="sticky top-0 bg-white z-10">
              <tr>
                {headerLabels.map((label, index) => (
                  <th key={index}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array(10).fill().map((_, index) => (
                <tr key={index}>
                  <td><SkeletonLoader type="cell" /></td>
                  <td><SkeletonLoader type="cell" /></td>
                  <td><SkeletonLoader type="cell" /></td>
                  <td><SkeletonLoader type="cell" /></td>
                  <td><SkeletonLoader type="button" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <Notification
        show={showNotification}
        message={notificationMessage}
        description={notificationDescription}
        onClose={() => setShowNotification(false)}
      />
      <div 
        ref={tableContainerRef} 
        className="overflow-y-auto"
        style={{ maxHeight: '35rem' }} 
        onScroll={handleScroll}
      >
        <table ref={tableRef} style={{ width: '100%', height: totalHeight }}>
          <thead className="sticky top-0 bg-white z-10">
            <tr>
              {headerLabels.map((label, index) => (
                <th key={index}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr style={{ height: visibleStartIndex * rowHeight }} />
            {visibleRows().map(rowIndex => {
              const staffId = rowStaffIDs[rowIndex];
              const isEditing = editingRow === rowIndex;
              const isAnyRowEditing = editingRow !== null;
              const isDisabled = isAnyRowEditing && !isEditing;

              return (
                <tr 
                  key={rowIndex}
                  className={`
                    ${isEditing ? 'bg-blue-50' : ''}
                    ${isDisabled ? 'opacity-50' : ''}
                  `}
                  style={{ height: rowHeight }}
                >
                  <td>
                    {staffId ? (
                      isEditing ? (
                        <input
                          type="text"
                          value={editingValues.name || ''}
                          onChange={(e) => handleEditChange('name', e.target.value)}
                          placeholder="Name e.g. John"
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        <div className="p-1">{inputValues[rowIndex] || ''}</div>
                      )
                    ) : (
                      <input
                        type="text"
                        value={inputValues[rowIndex] || ''}
                        onChange={(e) => handleInputChange(rowIndex, e.target.value)}
                        placeholder="Name e.g. John"
                        className="w-full p-1 border rounded"
                        disabled={isDisabled}
                      />
                    )}
                  </td>
                  <td>
                    {staffId ? (
                      isEditing ? (
                        <input
                          type="text"
                          value={editingValues.role || ''}
                          onChange={(e) => handleEditChange('role', e.target.value)}
                          placeholder="Role e.g. Bar Tender"
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        <div className="p-1">{roleValues[rowIndex] || ''}</div>
                      )
                    ) : (
                      <input
                        type="text"
                        value={roleValues[rowIndex] || ''}
                        onChange={(e) => handleRoleChange(rowIndex, e.target.value)}
                        placeholder="Role e.g. Bar Tender"
                        className="w-full p-1 border rounded"
                        disabled={isDisabled}
                      />
                    )}
                  </td>
                  <td>
                    {staffId ? (
                      isEditing ? (
                        <input
                          type="text"
                          value={editingValues.comments || ''}
                          onChange={(e) => handleEditChange('comments', e.target.value)}
                          placeholder="Comments e.g. New"
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        <div className="p-1">{commentValues[rowIndex] || ''}</div>
                      )
                    ) : (
                      <input
                        type="text"
                        value={commentValues[rowIndex] || ''}
                        onChange={(e) => handleCommentChange(rowIndex, e.target.value)}
                        placeholder="Comments e.g. New"
                        className="w-full p-1 border rounded"
                        disabled={isDisabled}
                      />
                    )}
                  </td>
                  <td>
                    <Availability
                      value={isEditing ? editingValues.availability : (availabilityValues[rowIndex] || [])}
                      onChange={(days) => isEditing ? handleEditChange('availability', days) : handleAvailabilityChange(rowIndex, days)}
                      disabled={staffId ? (!isEditing || isDisabled) : isDisabled}
                    />
                  </td>
                  <td className="flex gap-1">
                    {staffId ? (
                      <>
                        <EditButton
                          onEdit={() => isEditing ? handleSaveClick(rowIndex) : handleEditClick(rowIndex)}
                          isEditing={isEditing}
                          disabled={isDisabled}
                        />
                        {isEditing && (
                          <button
                            onClick={handleCancelEdit}
                            className="border border-gray-300 px-2 py-1 text-sm rounded hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                        )}
                        <RemoveButton 
                          onRemove={() => handleRemoveClick(rowIndex)} 
                          disabled={isDisabled}
                        />
                      </>
                    ) : inputValues[rowIndex] && !rowStaffIDs[rowIndex] ? (
                      <AddButton
                        onAdd={() => handleAddClick(rowIndex)}
                        disabled={!isValidName(inputValues[rowIndex]) || isDisabled}
                      />
                    ) : null}
                  </td>
                </tr>
              );
            })}
            <tr style={{ height: (rows.length - visibleStartIndex - visibleRows().length) * rowHeight }} />
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StaffList;
