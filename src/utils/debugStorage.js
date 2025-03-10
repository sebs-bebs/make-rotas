import { STORAGE_KEYS, CURRENT_DEBUG_SCHEMA_VERSION, DEBUG_STATE_STRUCTURE } from './constants';

// Initialize debug storage with schema version
export const initializeDebugStorage = () => {
  const currentVersion = localStorage.getItem(STORAGE_KEYS.DEBUG_SCHEMA_VERSION);
  
  if (!currentVersion) {
    localStorage.setItem(STORAGE_KEYS.DEBUG_SCHEMA_VERSION, CURRENT_DEBUG_SCHEMA_VERSION.toString());
    localStorage.setItem(STORAGE_KEYS.DEBUG_STATE, JSON.stringify({
      ...DEBUG_STATE_STRUCTURE,
      lastUpdated: new Date().toISOString()
    }));
    return true;
  }
  return false;
};

// Save debug state with optimized storage
export const saveDebugState = (componentName, variables) => {
  try {
    const debugState = JSON.parse(localStorage.getItem(STORAGE_KEYS.DEBUG_STATE) || '{}');
    const timestamp = new Date().toISOString();

    // Update only the changed component
    debugState.components = {
      ...debugState.components,
      [componentName]: variables
    };
    debugState.lastUpdated = timestamp;
    debugState.version = CURRENT_DEBUG_SCHEMA_VERSION;

    localStorage.setItem(STORAGE_KEYS.DEBUG_STATE, JSON.stringify(debugState));
    return true;
  } catch (error) {
    console.error('Error saving debug state:', error);
    return false;
  }
};

// Load debug state for a specific component
export const loadDebugState = (componentName) => {
  try {
    const debugState = JSON.parse(localStorage.getItem(STORAGE_KEYS.DEBUG_STATE) || '{}');
    return debugState.components?.[componentName] || null;
  } catch (error) {
    console.error('Error loading debug state:', error);
    return null;
  }
};

// Load all debug state
export const loadAllDebugState = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.DEBUG_STATE) || '{}');
  } catch (error) {
    console.error('Error loading all debug state:', error);
    return null;
  }
};
