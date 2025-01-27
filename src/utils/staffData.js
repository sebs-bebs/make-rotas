import { STORAGE_KEYS } from './staffConstants';
import { validateStaffMember } from './staffValidation';

// Data-specific error types
const DATA_ERRORS = {
  STORAGE_FULL: 'STORAGE_FULL',
  INVALID_DATA: 'INVALID_DATA',
  NOT_FOUND: 'NOT_FOUND',
  SAVE_FAILED: 'SAVE_FAILED'
};

/**
 * Generate a unique staff ID
 * @returns {string} New staff ID
 */
export const generateStaffId = () => {
  const lastId = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_STAFF_ID) || '0');
  const newId = lastId + 1;
  localStorage.setItem(STORAGE_KEYS.LAST_STAFF_ID, newId.toString());
  return `staff_${newId}`;
};

/**
 * Save a staff member to storage
 * @param {Object} staffMember - Staff member to save
 * @returns {Object} Result of save operation
 */
export const saveStaffMember = (staffMember) => {
  try {
    // Validate first
    const validation = validateStaffMember(staffMember);
    if (!validation.isValid) {
      return {
        success: false,
        error: DATA_ERRORS.INVALID_DATA,
        details: validation
      };
    }

    // Save the staff member
    const key = `staff_${staffMember.staffID}`;
    localStorage.setItem(key, JSON.stringify(staffMember));

    // Update staff list
    const staffList = JSON.parse(localStorage.getItem(STORAGE_KEYS.STAFF_LIST) || '[]');
    if (!staffList.includes(staffMember.staffID)) {
      staffList.push(staffMember.staffID);
      localStorage.setItem(STORAGE_KEYS.STAFF_LIST, JSON.stringify(staffList));
    }

    return {
      success: true,
      staffId: staffMember.staffID,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: DATA_ERRORS.SAVE_FAILED,
      details: error.message
    };
  }
};

/**
 * Load a staff member from storage
 * @param {string} staffId - ID of staff member to load
 * @returns {Object} Staff member data or error
 */
export const loadStaffMember = (staffId) => {
  try {
    const key = `staff_${staffId}`;
    const data = localStorage.getItem(key);
    
    if (!data) {
      return {
        success: false,
        error: DATA_ERRORS.NOT_FOUND,
        staffId
      };
    }

    return {
      success: true,
      data: JSON.parse(data)
    };
  } catch (error) {
    return {
      success: false,
      error: DATA_ERRORS.INVALID_DATA,
      details: error.message
    };
  }
};

/**
 * Load all staff members
 * @returns {Object} Array of staff members or error
 */
export const loadAllStaffMembers = () => {
  try {
    const staffList = JSON.parse(localStorage.getItem(STORAGE_KEYS.STAFF_LIST) || '[]');
    const staffMembers = staffList
      .map(id => loadStaffMember(id))
      .filter(result => result.success)
      .map(result => result.data);

    return {
      success: true,
      data: staffMembers
    };
  } catch (error) {
    return {
      success: false,
      error: DATA_ERRORS.INVALID_DATA,
      details: error.message
    };
  }
};

/**
 * Remove a staff member
 * @param {string} staffId - ID of staff member to remove
 * @returns {Object} Result of remove operation
 */
export const removeStaffMember = (staffId) => {
  try {
    // Remove from storage
    const key = `staff_${staffId}`;
    localStorage.removeItem(key);

    // Update staff list
    const staffList = JSON.parse(localStorage.getItem(STORAGE_KEYS.STAFF_LIST) || '[]');
    const newList = staffList.filter(id => id !== staffId);
    localStorage.setItem(STORAGE_KEYS.STAFF_LIST, JSON.stringify(newList));

    return {
      success: true,
      staffId,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: DATA_ERRORS.SAVE_FAILED,
      details: error.message
    };
  }
};
