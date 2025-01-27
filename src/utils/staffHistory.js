import { STORAGE_KEYS } from './staffConstants';

// History-specific constants
const HISTORY_CONSTANTS = {
  MAX_HISTORY_LENGTH: 50,  // Maximum number of history entries to keep
  NOTIFICATION_DURATION: 5000  // How long to show notifications (ms)
};

/**
 * Compare two values and detect actual changes
 * @param {any} oldValue - Original value
 * @param {any} newValue - New value
 * @returns {boolean} True if values are different
 */
const hasValueChanged = (oldValue, newValue) => {
  // Handle arrays (like availability)
  if (Array.isArray(oldValue) && Array.isArray(newValue)) {
    if (oldValue.length !== newValue.length) return true;
    return oldValue.some((val, idx) => val !== newValue[idx]);
  }
  
  // Handle objects
  if (typeof oldValue === 'object' && typeof newValue === 'object') {
    return JSON.stringify(oldValue) !== JSON.stringify(newValue);
  }
  
  // Handle primitives
  return oldValue !== newValue;
};

/**
 * Detect which fields have actually changed
 * @param {Object} oldData - Original staff data
 * @param {Object} newData - New staff data
 * @returns {Object} Changed fields and their values
 */
export const detectChanges = (oldData, newData) => {
  const changes = {};
  const changedFields = [];

  Object.keys(newData).forEach(key => {
    if (hasValueChanged(oldData[key], newData[key])) {
      changes[key] = {
        from: oldData[key],
        to: newData[key]
      };
      changedFields.push(key);
    }
  });

  return {
    hasChanges: changedFields.length > 0,
    changes,
    changedFields
  };
};

/**
 * Generate user-friendly message about changes
 * @param {string} staffName - Name of staff member
 * @param {string[]} changedFields - List of changed fields
 * @returns {string} User-friendly message
 */
export const generateChangeMessage = (staffName, changedFields) => {
  const fieldNames = changedFields.map(field => {
    switch (field) {
      case 'fullName': return 'name';
      case 'availability': return 'schedule';
      default: return field;
    }
  });

  if (fieldNames.length === 0) return '';
  if (fieldNames.length === 1) {
    return `Updated ${staffName}'s ${fieldNames[0]}`;
  }
  
  const lastField = fieldNames.pop();
  return `Updated ${staffName}'s ${fieldNames.join(', ')} and ${lastField}`;
};

/**
 * Create a new history entry
 * @param {string} staffId - Staff member ID
 * @param {Object} changes - Detected changes
 * @returns {Object} History entry
 */
export const createHistoryEntry = (staffId, changes) => ({
  timestamp: new Date().toISOString(),
  staffId,
  changes: changes.changes,
  changedFields: changes.changedFields,
  type: 'EDIT'  // For future different types of changes
});

/**
 * Save history entry to storage
 * @param {string} staffId - Staff member ID
 * @param {Object} entry - History entry to save
 */
export const saveHistory = (staffId, entry) => {
  try {
    const key = `${STORAGE_KEYS.STAFF_PREFIX}${staffId}_history`;
    const history = JSON.parse(localStorage.getItem(key) || '[]');
    
    // Add new entry and limit size
    history.push(entry);
    if (history.length > HISTORY_CONSTANTS.MAX_HISTORY_LENGTH) {
      history.shift(); // Remove oldest entry
    }
    
    localStorage.setItem(key, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save history:', error);
  }
};

/**
 * Load history for a staff member
 * @param {string} staffId - Staff member ID
 * @returns {Array} History entries
 */
export const loadHistory = (staffId) => {
  try {
    const key = `${STORAGE_KEYS.STAFF_PREFIX}${staffId}_history`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
};

/**
 * Format history entry for display
 * @param {Object} entry - History entry
 * @returns {Object} Formatted entry for display
 */
export const formatHistoryEntry = (entry) => {
  const date = new Date(entry.timestamp);
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return {
    time,
    message: generateChangeMessage(entry.staffName, entry.changedFields),
    changes: entry.changes,
    id: entry.timestamp // Use timestamp as unique ID
  };
};
