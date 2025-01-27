/**
 * Shared constants for staff management
 */

// Staff member states
export const STAFF_STATES = {
  NEW: 'NEW',
  SAVED: 'SAVED',
  EDITING: 'EDITING'
};

// Common storage keys
export const STORAGE_KEYS = {
  STAFF_LIST: 'staff_list',        // List of all staff IDs
  LAST_STAFF_ID: 'last_staff_id'   // Counter for generating IDs
};

// Staff validation rules
export const VALIDATION_RULES = {
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MIN_AVAILABILITY_DAYS: 1
};
