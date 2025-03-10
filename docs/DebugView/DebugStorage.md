# Debug Storage System Documentation

## Overview
The Debug Storage System provides persistent storage for component debug states across page refreshes and sessions. It uses a separate storage key system from the main application data to maintain clean separation of concerns.

## Storage Structure

### Keys
```javascript
DEBUG_PREFIX: 'debug_'           // Prefix for all debug-related storage
DEBUG_STATE: 'debug_state_data'  // Main debug state storage
DEBUG_SCHEMA_VERSION: 'debug_schema_version' // Schema versioning
```

### Debug State Structure
```javascript
{
  version: 1,                    // Current schema version
  components: {
    TabNavigation: {            // Component-specific debug data
      activeTab: String,
      activeComponents: Object
    },
    StaffDetail: {
      staffMembers: Array
    },
    StaffList: Object,
    ShiftTable: Object
  },
  lastUpdated: ISO_STRING        // Timestamp of last update
}
```

## Key Features

### 1. Schema Versioning
- Each debug state has a version number
- Allows for future schema updates
- Maintains backward compatibility
- Current version: 1

### 2. Component Isolation
- Each component's debug state is stored separately
- Updates only affect the changed component
- Prevents unnecessary storage operations
- Maintains clean component boundaries

### 3. Optimized Storage
- Only saves changed values
- Deep comparison before updates
- Maintains last updated timestamps
- Prevents redundant storage operations

### 4. State Persistence
- Debug states survive page refreshes
- First-time user initialization
- Automatic state recovery
- Error handling for corrupt states

## Usage Examples

### 1. Standard Component Update
```javascript
// Component updates its debug state
updateDebugVariables({
  ComponentName: {
    variableName: {
      value: newValue,
      lastUpdated: timestamp,
      type: "string"
    }
  }
});

// Automatically stored as:
{
  version: 1,
  components: {
    ComponentName: {
      variableName: {
        value: newValue,
        lastUpdated: timestamp,
        type: "string"
      }
    }
  },
  lastUpdated: timestamp
}
```

### 2. First-Time Load
```javascript
// On first visit:
1. Initializes schema version
2. Creates default state structure
3. Sets initial timestamps
4. Begins tracking debug variables
```

### 3. State Recovery
```javascript
// On page load:
1. Checks schema version
2. Loads saved state if valid
3. Initializes new state if needed
4. Updates component debug variables
```

## Best Practices

### 1. Debug Variable Updates
- Include descriptive types
- Add meaningful timestamps
- Provide clear descriptions
- Use consistent naming

### 2. Storage Operations
- Check for actual changes
- Handle storage errors gracefully
- Maintain schema compatibility
- Clean up old debug data

### 3. Component Integration
- Initialize on component mount
- Clear on component unmount
- Update on significant changes
- Maintain state isolation
