// Storage keys for the application
export const STORAGE_KEYS = {
  // Staff related keys
  STAFF_PREFIX: 'staff_',
  STAFF_LIST: 'staff_list_data',
  STAFF_HISTORY: 'staff_history_',
  
  // Debug related keys
  DEBUG_PREFIX: 'debug_',
  DEBUG_STATE: 'debug_state_data',
  DEBUG_SCHEMA_VERSION: 'debug_schema_version',
  
  // Application state keys
  APP_PREFIX: 'app_',
  HAS_VISITED: 'app_has_visited',
  ACTIVE_TAB: 'app_active_tab',
  
  // Schema versions
  SCHEMA_VERSION: 'schema_version'
};

// Debug schema version
export const CURRENT_DEBUG_SCHEMA_VERSION = 1;

// Debug state structure
export const DEBUG_STATE_STRUCTURE = {
  version: CURRENT_DEBUG_SCHEMA_VERSION,
  components: {
    TabNavigation: {
      activeTab: {
        value: "ShiftTable",
        lastUpdated: new Date().toISOString(),
        type: "string",
        description: "Currently active tab"
      },
      activeComponents: {
        value: {
          ShiftTable: true,    // Active by default
          StaffList: false,    // Inactive by default
          TabNavigation: true, // Always active
          StaffDetail: true    // Always active
        },
        lastUpdated: new Date().toISOString(),
        type: "object",
        description: "Active state of each component"
      }
    },
    StaffDetail: {
      staffMembers: []
    },
    StaffList: {},
    ShiftTable: {}
  },
  lastUpdated: null
};
