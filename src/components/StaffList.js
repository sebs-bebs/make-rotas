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

  // Add the new state for upload error
  const [uploadError, setUploadError] = useState(null);

  // Add the file change handler
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop().toLowerCase();

    const reader = new FileReader();
    reader.onload = (e) => {
      const fileContent = e.target.result;

      try {
        let parsedData;
        if (fileExtension === 'json') {
          parsedData = parseJSON(fileContent);
        } else if (fileExtension === 'csv') {
          parsedData = parseCSV(fileContent);
        } else {
          throw new Error('Unsupported file type. Please upload a JSON or CSV file.');
        }

        console.log('Parsed Staff Data:', parsedData);

        // Call addBulkStaff with the parsed data
        addBulkStaff(parsedData);

        // Optional: Reset the file input
        event.target.value = null;
      } catch (error) {
        console.error('Error parsing file:', error.message);
        setUploadError(error.message);
      }
    };

    reader.onerror = () => {
      setUploadError('Failed to read the file. Please try again.');
    };

    reader.readAsText(file);
  };

  // Helper function to parse JSON
  const parseJSON = (content) => {
    const data = JSON.parse(content);

    if (!Array.isArray(data)) {
      throw new Error('Invalid JSON format. Expected an array of staff objects.');
    }

    return data.map((staff) => {
      if (!staff.fullName || !staff.role || !staff.comments || !Array.isArray(staff.availability)) {
        throw new Error('Invalid JSON structure. Each staff object must have fullName, role, comments, and availability.');
      }
      return staff;
    });
  };

  // Helper function to parse CSV
  const parseCSV = (content) => {
    const lines = content.split('\n').map((line) => line.trim()).filter((line) => line);
    const headers = lines[0].split(',').map((header) => header.trim());

    if (headers.length !== 4 || headers[0] !== 'staffName' || headers[1] !== 'role' || headers[2] !== 'comments' || headers[3] !== 'availability') {
      throw new Error('Invalid CSV format. Expected headers: staffName,role,comments,availability.');
    }

    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map((value) => value.trim());
      if (values.length !== 4) {
        throw new Error(`Invalid CSV row at line ${index + 2}. Each row must have 4 values.`);
      }

      return {
        fullName: values[0],
        role: values[1],
        comments: values[2],
        availability: values[3].split(';').map((day) => day.trim()),
      };
    });
  };

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

  const addBulkStaff = (staffArray) => {
    try {
      // Validate the staff array
      const validStaff = validateStaffArray(staffArray);
  
      if (validStaff.length === 0) {
        setUploadError('No valid staff found in the file.');
        return;
      }
  
      // Add each valid staff member to the context
      validStaff.forEach((staff) => {
        addStaffMember({
          staffID: generateStaffID(),
          fullName: staff.fullName,
          role: staff.role || '',
          comments: staff.comments || '',
          availability: staff.availability || [],
          inList: true,
          state: 'SAVED',
        });
      });
  
      // Show success notification
      setNotificationMessage('Staff members successfully imported!');
      setShowNotification(true);
  
      // Clear any previous errors
      setUploadError(null);
    } catch (error) {
      console.error('Error adding bulk staff:', error.message);
      setUploadError('Failed to import staff. Please check the file format and try again.');
    }
  };

  const validateStaffArray = (staffArray) => {
    if (!Array.isArray(staffArray)) {
      throw new Error('Invalid input: Expected an array of staff objects.');
    }
  
    return staffArray.map((staff, index) => {
      if (typeof staff !== 'object' || staff === null) {
        throw new Error(`Invalid staff object at index ${index}: Expected an object.`);
      }
  
      const { fullName, role, comments, availability } = staff;
  
      // Validate fullName (required, non-empty string)
      if (!fullName || typeof fullName !== 'string' || fullName.trim() === '') {
        throw new Error(`Invalid fullName at index ${index}: Must be a non-empty string.`);
      }
  
      // Validate role (optional, default to '')
      const validatedRole = typeof role === 'string' ? role : '';
  
      // Validate comments (optional, default to '')
      const validatedComments = typeof comments === 'string' ? comments : '';
  
      // Validate availability (optional, default to [])
      const validatedAvailability = Array.isArray(availability)
        ? availability.filter((day) => typeof day === 'string' && day.trim() !== '')
        : [];
  
      return {
        fullName: fullName.trim(),
        role: validatedRole,
        comments: validatedComments,
        availability: validatedAvailability,
      };
    });
  };

  const headerLabels = ['STAFF', 'ROLE', 'COMMENTS', 'AVAILABILITY', ''];

  return (
    <div className="w-full px-2 sm:px-4">
      <Notification
        show={showNotification}
        message={notificationMessage}
        description={notificationDescription}
        onClose={() => setShowNotification(false)}
      />
      
      {/* Responsive table wrapper */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headerLabels.map((label, index) => (
                <th 
                  key={index}
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((_, rowIndex) => {
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
                    hover:bg-gray-50
                  `}
                >
                  <td className="px-2 py-2 whitespace-nowrap text-sm">
                    {staffId ? (
                      isEditing ? (
                        <input
                          type="text"
                          value={editingValues.name || ''}
                          onChange={(e) => handleEditChange('name', e.target.value)}
                          placeholder="Name"
                          className="w-full p-1 border rounded text-sm"
                        />
                      ) : (
                        <div className="p-1">{inputValues[rowIndex] || ''}</div>
                      )
                    ) : (
                      <input
                        type="text"
                        value={inputValues[rowIndex] || ''}
                        onChange={(e) => handleInputChange(rowIndex, e.target.value)}
                        placeholder="Name"
                        className="w-full p-1 border rounded text-sm"
                        disabled={isDisabled}
                      />
                    )}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-sm">
                    {staffId ? (
                      isEditing ? (
                        <input
                          type="text"
                          value={editingValues.role || ''}
                          onChange={(e) => handleEditChange('role', e.target.value)}
                          placeholder="Role"
                          className="w-full p-1 border rounded text-sm"
                        />
                      ) : (
                        <div className="p-1">{roleValues[rowIndex] || ''}</div>
                      )
                    ) : (
                      <input
                        type="text"
                        value={roleValues[rowIndex] || ''}
                        onChange={(e) => handleRoleChange(rowIndex, e.target.value)}
                        placeholder="Role"
                        className="w-full p-1 border rounded text-sm"
                        disabled={isDisabled}
                      />
                    )}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-sm">
                    {staffId ? (
                      isEditing ? (
                        <input
                          type="text"
                          value={editingValues.comments || ''}
                          onChange={(e) => handleEditChange('comments', e.target.value)}
                          placeholder="Comments"
                          className="w-full p-1 border rounded text-sm"
                        />
                      ) : (
                        <div className="p-1">{commentValues[rowIndex] || ''}</div>
                      )
                    ) : (
                      <input
                        type="text"
                        value={commentValues[rowIndex] || ''}
                        onChange={(e) => handleCommentChange(rowIndex, e.target.value)}
                        placeholder="Comments"
                        className="w-full p-1 border rounded text-sm"
                        disabled={isDisabled}
                      />
                    )}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-sm">
                    <Availability
                      value={isEditing ? editingValues.availability : (availabilityValues[rowIndex] || [])}
                      onChange={(days) => isEditing ? handleEditChange('availability', days) : handleAvailabilityChange(rowIndex, days)}
                      disabled={staffId ? (!isEditing || isDisabled) : isDisabled}
                    />
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-sm">
                    <div className="flex flex-col sm:flex-row gap-1">
                      {staffId ? (
                        <>
                          <EditButton
                            onEdit={() => isEditing ? handleSaveClick(rowIndex) : handleEditClick(rowIndex)}
                            isEditing={isEditing}
                            disabled={isDisabled}
                            className="w-full sm:w-auto"
                          />
                          {isEditing && (
                            <button
                              onClick={handleCancelEdit}
                              className="w-full sm:w-auto border border-gray-300 px-2 py-1 text-sm rounded hover:bg-gray-100"
                            >
                              Cancel
                            </button>
                          )}
                          <RemoveButton 
                            onRemove={() => handleRemoveClick(rowIndex)} 
                            disabled={isDisabled}
                            className="w-full sm:w-auto"
                          />
                        </>
                      ) : inputValues[rowIndex] && !rowStaffIDs[rowIndex] ? (
                        <AddButton
                          onAdd={() => handleAddClick(rowIndex)}
                          disabled={!isValidName(inputValues[rowIndex]) || isDisabled}
                          className="w-full sm:w-auto"
                        />
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Responsive bulk upload section */}
      <div className="mt-8 p-3 sm:p-4 border rounded">
        <h3 className="text-lg font-semibold mb-2">Bulk Upload Staff List</h3>
        <p className="text-sm text-gray-600 mb-2">
          Upload a file containing your staff details. JSON and CSV formats accepted.
        </p>
        <code className="block p-2 mb-2 bg-gray-100 rounded text-xs sm:text-sm overflow-x-auto">
          staffName, role, comments, availability
          <br />
          <span className="font-bold text-blue-600">Example:</span> John Doe, Barista, Part-time, Monday;Wednesday
        </code>
        
        <div className="relative">
          <input 
            type="file" 
            accept=".json,.csv"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <button 
            type="button" 
            className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            Choose File
          </button>
        </div>

        {uploadError && (
          <p className="text-red-500 mt-2 text-sm">{uploadError}</p>
        )}
      </div>
    </div>
  );
}

export default StaffList;
