/**
 * Constants for storage keys and error types
 */
export const STORAGE_KEYS = {
  STAFF_PREFIX: 'staff_',
  HISTORY_PREFIX: 'staff_history_',
  STAFF_LIST: 'staff_list_data',
  SCHEMA_VERSION: 'schema_version'
};

export const STORAGE_ERRORS = {
  STORAGE_FULL: 'STORAGE_FULL',
  INVALID_DATA: 'INVALID_DATA',
  RETRY_FAILED: 'RETRY_FAILED',
  NOT_FOUND: 'NOT_FOUND',
  MIGRATION_FAILED: 'MIGRATION_FAILED'
};

/**
 * Check if we have enough storage space
 * @returns {boolean}
 */
const hasEnoughStorage = () => {
  try {
    const testKey = '___test___';
    const testData = new Array(1024).join('x'); // 1KB test
    localStorage.setItem(testKey, testData);
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate staff member data structure
 * @param {Object} data - Staff member data to validate
 * @returns {boolean}
 */
const isValidStaffData = (data) => {
  const requiredFields = ['staffID', 'fullName', 'role', 'availability'];
  return requiredFields.every(field => field in data);
};

/**
 * Save data to localStorage with retry
 * @param {string} key - Storage key
 * @param {Object} data - Data to store
 * @param {number} retryCount - Number of retries left
 * @returns {Promise<Object>} Result object
 */
const saveWithRetry = async (key, data, retryCount = 1) => {
  try {
    if (!hasEnoughStorage()) {
      throw new Error(STORAGE_ERRORS.STORAGE_FULL);
    }

    localStorage.setItem(key, JSON.stringify(data));
    
    return {
      success: true,
      timestamp: new Date().toISOString(),
      key
    };
  } catch (error) {
    if (retryCount > 0) {
      // Wait 100ms before retry
      await new Promise(resolve => setTimeout(resolve, 100));
      return saveWithRetry(key, data, retryCount - 1);
    }

    return {
      success: false,
      error: error.message,
      code: STORAGE_ERRORS.RETRY_FAILED,
      details: error.stack
    };
  }
};

// Current schema version
const CURRENT_SCHEMA_VERSION = 1;

// Schema migrations
const migrations = {
  1: (data) => {
    // Initial schema, no migration needed
    return data;
  }
  // Add more migrations as schema evolves:
  // 2: (data) => { migrate to v2 },
  // 3: (data) => { migrate to v3 },
};

/**
 * Get current schema version from localStorage
 * @returns {number} Current version or 0 if not set
 */
const getCurrentVersion = () => {
  const version = localStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION);
  return version ? parseInt(version, 10) : 0;
};

/**
 * Migrate data to latest schema version
 * @param {Object} data - Data to migrate
 * @param {number} fromVersion - Current version
 * @returns {Object} Migrated data
 */
const migrateData = (data, fromVersion) => {
  let currentData = { ...data };
  
  for (let version = fromVersion + 1; version <= CURRENT_SCHEMA_VERSION; version++) {
    if (migrations[version]) {
      currentData = migrations[version](currentData);
    }
  }
  
  return currentData;
};

/**
 * Save a staff member
 * @param {Object} staffMember - Staff member to save
 * @returns {Promise<Object>} Result object
 */
export const saveStaffMember = async (staffMember) => {
  if (!isValidStaffData(staffMember)) {
    return {
      success: false,
      error: 'Invalid staff member data',
      code: STORAGE_ERRORS.INVALID_DATA
    };
  }

  const key = `${STORAGE_KEYS.STAFF_PREFIX}${staffMember.staffID}`;
  return saveWithRetry(key, staffMember);
};

/**
 * Save staff member history
 * @param {string} staffId - Staff member ID
 * @param {Object} history - History object
 * @returns {Promise<Object>} Result object
 */
export const saveStaffHistory = async (staffId, history) => {
  const key = `${STORAGE_KEYS.HISTORY_PREFIX}${staffId}`;
  return saveWithRetry(key, history);
};

/**
 * Save staff list data (includes all staff and current state)
 * @param {Object} data - Staff list data to save
 * @returns {Promise<Object>} Result object
 */
export const saveStaffListData = async (data) => {
  const version = getCurrentVersion();
  console.log('Saving staff list data:', data); // Debug log
  
  // If first time saving, set schema version
  if (version === 0) {
    await saveWithRetry(STORAGE_KEYS.SCHEMA_VERSION, CURRENT_SCHEMA_VERSION);
  }
  
  const dataToSave = {
    version: CURRENT_SCHEMA_VERSION,
    data,
    updatedAt: new Date().toISOString()
  };
  
  console.log('Final data being saved:', dataToSave); // Debug log
  return saveWithRetry(STORAGE_KEYS.STAFF_LIST, dataToSave);
};

/**
 * Load a staff member
 * @param {string} staffId - Staff member ID to load
 * @returns {Object} Staff member data or null
 */
export const loadStaffMember = (staffId) => {
  try {
    const key = `${STORAGE_KEYS.STAFF_PREFIX}${staffId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: STORAGE_ERRORS.NOT_FOUND
    };
  }
};

/**
 * Load staff member history
 * @param {string} staffId - Staff member ID
 * @returns {Object} History object or null
 */
export const loadStaffHistory = (staffId) => {
  try {
    const key = `${STORAGE_KEYS.HISTORY_PREFIX}${staffId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: STORAGE_ERRORS.NOT_FOUND
    };
  }
};

/**
 * Load staff list data
 * @returns {Object} Staff list data or null
 */
export const loadStaffListData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.STAFF_LIST);
    console.log('Raw stored data:', stored); // Debug log
    
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    console.log('Parsed stored data:', parsed); // Debug log
    
    const { version, data } = parsed;
    const currentVersion = getCurrentVersion();

    // If stored data is from a newer version, we can't handle it
    if (version > CURRENT_SCHEMA_VERSION) {
      console.warn('Data is from a newer schema version');
      return null;
    }

    // Migrate data if needed
    if (version < CURRENT_SCHEMA_VERSION) {
      const migratedData = migrateData(data, version);
      // Save migrated data back
      saveStaffListData(migratedData);
      return migratedData;
    }

    return data;
  } catch (error) {
    console.error('Error loading staff list data:', error);
    return null;
  }
};

/**
 * Load all staff members
 * @returns {Array} Array of staff members
 */
export const loadAllStaffMembers = () => {
  try {
    const staffMembers = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(STORAGE_KEYS.STAFF_PREFIX)) {
        const data = localStorage.getItem(key);
        if (data) {
          staffMembers.push(JSON.parse(data));
        }
      }
    }
    return staffMembers;
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: STORAGE_ERRORS.NOT_FOUND
    };
  }
};
