# Local Storage Implementation Documentation

## Overview
This document details the local storage implementation for the Make-Rotas application, focusing on data persistence, schema versioning, and error handling.

## Storage Keys
```javascript
STORAGE_KEYS = {
  STAFF_PREFIX: 'staff_',           // Prefix for individual staff data
  HISTORY_PREFIX: 'staff_history_', // Prefix for staff history data
  STAFF_LIST: 'staff_list_data',    // Key for complete staff list
  SCHEMA_VERSION: 'schema_version'   // Current schema version
}
```

## Data Schema

### Current Version: 1
The application uses schema versioning to manage data structure changes. Current schema version is 1.

### Staff Member Data Structure
Required fields:
- `staffID`: Unique identifier
- `fullName`: Staff member's name
- `role`: Staff role
- `availability`: Availability schedule

### History Data Structure
Each history entry contains:
- `timestamp`: ISO string of when change occurred
- `staffId`: Associated staff member
- `changes`: Object containing old and new values
- `changedFields`: Array of field names that changed
- `type`: Change type (currently 'EDIT')

## Core Functions

### Data Saving
1. **saveWithRetry**
   - Implements retry mechanism (1 retry attempt)
   - 100ms delay between retries
   - Checks storage availability before saving
   - Returns result object with success status and timestamp

2. **Storage Space Check**
   - Tests storage availability with 1KB sample data
   - Prevents data loss from storage limits
   - Returns boolean indicating storage availability

### Data Loading
1. **loadStaffListData**
   - Loads complete staff list
   - Handles schema version checking
   - Implements data migration if needed
   - Returns null if data is from newer schema

2. **loadStaffMember**
   - Loads individual staff data
   - Returns null if not found
   - Includes error handling

### History Management
1. **Maximum History**
   - Keeps last 50 entries per staff member
   - Notification duration: 5000ms

2. **Change Detection**
   - Compares old and new values
   - Special handling for arrays and objects
   - Generates user-friendly change messages

## Error Handling

### Error Types
```javascript
STORAGE_ERRORS = {
  STORAGE_FULL: 'STORAGE_FULL',
  INVALID_DATA: 'INVALID_DATA',
  RETRY_FAILED: 'RETRY_FAILED',
  NOT_FOUND: 'NOT_FOUND',
  MIGRATION_FAILED: 'MIGRATION_FAILED'
}
```

### Error Responses
All error responses follow structure:
```javascript
{
  success: false,
  error: message,
  code: errorType,
  details: errorStack // when available
}
```

## Data Migration

### Migration System
- Versioned migration functions
- Forward-only migrations
- Rejects data from newer versions
- Current migrations:
  ```javascript
  migrations = {
    1: (data) => data // Initial schema
    // Future versions will be added here
  }
  ```

## Best Practices

### 1. Data Validation
- Always validate data structure before saving
- Check required fields presence
- Validate data types

### 2. Error Handling
- Always use try-catch blocks
- Implement retry mechanism for saves
- Return structured error responses

### 3. Storage Management
- Check storage availability before saves
- Clean up old data when appropriate
- Maintain history length limits

### 4. Schema Updates
1. Increment `CURRENT_SCHEMA_VERSION`
2. Add migration function
3. Test backward compatibility
4. Never remove migration functions

## Critical Considerations

### 1. Storage Limits
- Test storage availability before saves
- Implement cleanup strategies
- Monitor history entry count

### 2. Data Integrity
- Validate all data before storage
- Use schema versioning
- Implement retry mechanisms

### 3. Performance
- Minimize storage operations
- Batch updates when possible
- Clean up old data regularly

## Future Enhancements
1. Compression for history data
2. Batch save operations
3. Enhanced migration system
4. Storage quota management
5. Automated cleanup strategies

## Debugging

### Debug Information
Storage operations log:
- Raw stored data
- Parsed data structure
- Migration attempts
- Version conflicts

### Common Issues
1. Storage full
   - Solution: Implement cleanup
   - Monitor storage usage

2. Invalid data structure
   - Solution: Validate before save
   - Check schema version

3. Migration failures
   - Solution: Check version compatibility
   - Validate migration functions
