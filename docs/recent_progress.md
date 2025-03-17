# Recent Progress and Priorities

## Current Focus (as of 2025-03-13)

### Shift Data Persistence Fix
1. **Issue Overview**
   - Fixed critical issue with shifts disappearing when navigating between weeks
   - Implemented stable row IDs for staff members to ensure data consistency
   - Enhanced ShiftSlot component to properly handle null/empty data
   - Improved localStorage integration for reliable data persistence

2. **Key Components Modified**
   - **ShiftTable.js**
     - Implemented stable row IDs based on staff names instead of timestamps
     - Modified `getShiftForCell` to return empty objects instead of null
     - Added immediate localStorage persistence to prevent data loss
     - Enhanced week navigation to properly preserve shift data
   
   - **ShiftSlot.js**
     - Improved handling of null and empty shift data
     - Added explicit conditional logic for data display
     - Enhanced logging for better debugging

3. **Technical Improvements**
   - **Data Consistency**
     ```javascript
     // Before: Using unstable timestamp-based IDs
     const newRowId = `row-${Date.now()}-${staff.id}`;
     
     // After: Creating stable IDs based on staff name
     const stableRowId = `row-staff-${staff.name.replace(/\s+/g, '-').toLowerCase()}`;
     ```

   - **Better Error Handling**
     ```javascript
     // Before: Returning null when no shift data found
     return null;
     
     // After: Returning empty object instead of null
     return {};
     ```

   - **Improved Data Flow**
     - Added detailed logging of shift data operations
     - Implemented immediate localStorage updates
     - Used consistent key structure for week-specific data

4. **Documentation**
   - Added detailed documentation to bugs_fixes.md
   - Documented root causes and solutions
   - Provided code examples and prevention strategies

### Staff to Rota Feature Implementation
1. **Feature Overview**
   - Implemented ability to add staff to the rota from a filtered list
   - Added popup interface for staff selection with search functionality
   - Implemented notification system for confirming staff additions
   - Created disabled state for Add Staff button when no staff available
   - Added tooltip for disabled button explaining lack of available staff

2. **Component Implementation**
   - **AddStaffButton**
     - Created dedicated button component for adding staff 
     - Added support for disabled state with debug tracking
     - Implemented hover tooltip for disabled state
   
   - **StaffSelector**
     - Popup component for staff selection
     - Filters out staff already in rota
     - Only shows staff with inList=true
     - Includes search functionality
     - Auto-closes after staff selection

   - **ShiftTable**
     - Integrated StaffSelector component
     - Implemented staff addition logic
     - Added notification system
     - Implemented localStorage persistence
     - Added logic for tracking available staff

3. **User Experience Improvements**
   - Temporary notification appears when staff added
   - Add Staff button automatically disables when no staff available
   - Hover tooltip explains why button is disabled
   - Popup auto-closes after staff selection
   - Staff selector shows only relevant staff

4. **Storage Implementation**
   ```javascript
   // Two localStorage keys used:
   shiftTableRows: [
     {
       id: 'row-1',
       cells: ['STAFF', 'Monday\n2025-03-10', '...']
     },
     {
       id: 'row-12345',
       cells: ['Staff Name', '', '', '...']
     }
   ]
   
   shiftTableStaffIDs: {
     'row-12345': 'staff-123',  // Maps row ID to staff ID
   }
   ```

5. **Debug Integration**
   - All key states and actions tracked in debug system
   - Popup open/close state tracked
   - Available staff status tracked
   - Staff addition events tracked
   - Button disabled state tracked

### Implementation Strategy Improvements
1. **Question-Driven Development**
   - Break down complex changes into simple yes/no questions
   - Each question focuses on one specific aspect
   - Questions build upon previous answers
   - Example sequence:
     ```
     Q1: "Should TabNavigation be always active?"
     A1: "Yes"
     
     Q2: "Should StaffDetail be always active?"
     A2: "Yes"
     
     Q3: "For first-time users, which tab should be active?"
     A3: "ShiftTable"
     ```

2. **Visual State Communication**
   - Show exact expected states
   - Use consistent formatting
   - Include helpful comments
   - Example:
     ```
     Expected Debug View:
     ▶ StaffDetail (Active)      // Always active
     ▶ TabNavigation (Active)    // Always active
     ▶ StaffList (Inactive)      // Inactive by default
     ▶ ShiftTable (Active)       // Active because default
     ```

3. **Storage Structure Clarity**
   - Show exact data formats
   - Comment each field's purpose
   - Example:
     ```javascript
     debug_state_data: {
       components: {
         TabNavigation: {
           activeTab: {
             value: "ShiftTable",    // Current tab
             lastUpdated: "<time>"   // When changed
           }
         }
       }
     }
     ```

4. **Step-by-Step Testing**
   - Clear, numbered steps
   - Expected outcome per step
   - Example:
     ```
     1. Clear storage
        → All data removed
     
     2. Refresh page
        → ShiftTable active
        → StaffList inactive
     ```

5. **Error Prevention**
   - Show what's wrong
   - Show what's right
   - Example:
     ```
     ❌ All active:
     ▶ All components (Active)    // Wrong
     
     ✅ Correct state:
     ▶ ShiftTable (Active)        // Right
     ▶ StaffList (Inactive)       // Right
     ```

### Bug Resolution Strategy
1. **Visual Bug Detection**
   - Show current incorrect state
   - Show expected correct state
   - Example:
     ```
     Bug Found:
     ▶ StaffDetail (Active)
     ▶ TabNavigation (Active)
     ▶ StaffList (Active)      // Wrong!
     ▶ ShiftTable (Active)     // Wrong!
     
     Should Be:
     ▶ StaffDetail (Active)
     ▶ TabNavigation (Active)
     ▶ StaffList (Inactive)    // Correct
     ▶ ShiftTable (Active)     // Correct
     ```

2. **Root Cause Analysis**
   - Check initialization code:
     ```javascript
     // Bug source found:
     const isActive = debugVariables?.TabNavigation?.activeComponents?.value?.[componentName] ?? true;
     // Default to true caused all components to be active
     
     // Fixed by:
     const isActive = React.useMemo(() => {
       if (componentName === 'TabNavigation' || componentName === 'StaffDetail') {
         return true;
       }
       const activeComponents = debugVariables?.TabNavigation?.activeComponents?.value;
       return activeComponents ? activeComponents[componentName] : false;
     }, [componentName, debugVariables]);
     ```

3. **Fix Verification Steps**
   ```
   1. Clear localStorage
      → Removes all stored states
   
   2. Refresh page
      → ShiftTable should be active
      → StaffList should be inactive
   
   3. Switch tabs
      → States should update correctly
      → Only one content tab active at a time
   ```

4. **Bug Prevention Patterns**
   - Default to inactive instead of active
   - Explicitly define always-active components
   - Use TypeScript-like nullish checks
   - Example:
     ```javascript
     // Instead of:
     value ?? true  // Dangerous default
     
     // Better:
     value ?? false // Safe default
     ```

5. **Documentation Updates**
   - Added explicit active state rules
   - Documented component dependencies
   - Created test scenarios
   - Example:
     ```
     Active State Rules:
     1. TabNavigation: Always active
     2. StaffDetail: Always active
     3. Content tabs (ShiftTable, StaffList):
        - Only one active at a time
        - Default to ShiftTable for new users
     ```

6. **Storage Initialization**
   - Added proper initial state
   - Set correct default values
   - Example:
     ```javascript
     DEBUG_STATE_STRUCTURE = {
       components: {
         TabNavigation: {
           activeComponents: {
             value: {
               ShiftTable: true,     // Default tab
               StaffList: false,     // Inactive
               TabNavigation: true,  // Always
               StaffDetail: true     // Always
             }
           }
         }
       }
     }
     ```

7. **Testing Edge Cases**
   - First-time user scenario
   - Returning user scenario
   - Tab switching
   - Page refresh
   - Example:
     ```
     Edge Cases Tested:
     ✓ New user sees ShiftTable active
     ✓ Returning user sees last active tab
     ✓ Active states persist after refresh
     ✓ Only one content tab active at once
     ```

### Week-Specific Staff Assignment Challenge (2025-03-15)

1. **Issue Overview**
   - Attempted to implement staff assignment that's specific to each week
   - Goal: Staff members should only appear in tables for weeks they are assigned to
   - Challenge: Modifications caused bugs including staff rows appearing in wrong order
   - Discarded changes due to unstable behavior

2. **Problem Breakdown**
   - **Data Structure Issues**
     - Need separate storage for global staff list vs. week-specific assignments
     - Week-specific data requires indexed storage by weekStartDate
     - Staff IDs vs. Staff Names inconsistency in different components
   
   - **Component Communication Challenges**
     - ShiftTable component needs to pass current week to StaffSelector
     - StaffSelector needs to filter based on both current table and week-specific assignments
     - Inconsistency between staffNamesInTable and currentStaffIds parameters
   
   - **UI Rendering Issues**
     - Proper ordering of header row, staff rows, and "Add Staff" row
     - Ensuring "Add Staff" button appears at the bottom of the table
     - Maintaining proper ordering when staff are added or removed

   - **State Management Complexities**
     - Multiple useEffect hooks managing the same state in different ways
     - Competing state updates causing rendering issues
     - Week navigation affecting staff display

3. **Future Implementation Approach**
   - **Simplified Data Structure**
     ```javascript
     // Single source of truth for staff by week
     shiftTableStaffByWeek: {
       "2025-03-10": ["Staff Name 1", "Staff Name 2"],
       "2025-03-17": ["Staff Name 3"]
     }
     ```

   - **Clear Component Responsibilities**
     - ShiftTable: Manage week-specific staff display and data
     - StaffSelector: Filter available staff based on week-specific assignments
     - Create helper functions for consistent data access patterns

   - **Rendering Strategy**
     - Always render header row first (id: 'row-1')
     - Then render staff rows with stable IDs
     - Always render "Add Staff" row last (id: 'row-2')
     - Maintain clear separation of these row types

   - **Unified State Management**
     - Single source of truth for staff assignments
     - Consolidated useEffect for loading week-specific data
     - Clear dependency chains to prevent race conditions

4. **Debugging Approach**
   - Log the structure of rows array before and after modifications
   - Track the weekStartDate being used in each component
   - Verify localStorage data structure matches expectations
   - Monitor staff filtering logic to ensure proper exclusions

5. **Testing Strategy**
   - Step 1: Create multiple weeks with different staff
   - Step 2: Navigate between weeks and verify correct staff appear
   - Step 3: Add/remove staff and verify week-specific behavior
   - Step 4: Refresh page and verify persistence

### Optimization Attempts (2025-03-16)

### ShiftTable and ShiftSlot Performance Optimizations

1. **Optimization Goals**
   - Improve performance for large datasets (50+ staff members)
   - Reduce re-renders in the ShiftSlot component
   - Implement virtualization in the ShiftTable component
   - Maintain all existing functionality and debugging capabilities

2. **Implementation Issues Encountered**
   - **Circular Dependencies**
     - Attempted to use `visibleStartIndex` before it was initialized
     - Incorrect reference order in component logic

   - **Incorrect Assumptions**
     - Initially assumed only one header row when there are actually two
     - Header row indices (0 and 1) must be excluded from virtualization calculations

   - **Data Loading Disparities**
     - StaffList not displaying test data generated by generateTestData.js
     - Issue identified: Multiple ways data is being loaded in different components
     - Fixed by ensuring test data generator populates all required storage keys for all components:
       - `staff_list` (array of staffIDs)
       - `staff_list_data` (bulk storage with staffMembers array)
       - `staff_<ID>` keys (individual staff records)

3. **Key Fixes Implemented**
   - Updated `generateTestData.js` to populate all storage keys consistently
   - Ensured proper staff ID registration in appropriate localStorage records
   - Fixed StaffTable virtualization logic to account for 2 header rows

4. **Optimization Approaches Explored**
   ```javascript
   // Attempted to memoize ShiftSlot component
   const ShiftSlot = React.memo(function ShiftSlot(props) {
     // Component logic
   }, (prevProps, nextProps) => {
     // Custom comparison logic
   });

   // Created shared time options array
   const ALL_TIME_OPTIONS = [
     "00:00", "00:30", "01:00", /* ... other times */
   ];
   ```

5. **Temporary Solution**
   - Created a separate `to_optimize` branch to isolate optimization attempts
   - Original functionality preserved in main branch
   - Need to revise optimization approach with better understanding of component architecture

6. **Next Steps for Optimization**
   - Develop better virtualization approach that respects existing component structure
   - Preserve all callback patterns and debug functionality 
   - Implement more targeted memoization strategies
   - Create comprehensive tests to verify performance improvements

### Latest Implementation (2025-01-28 06:40 UTC)
1. **Debug View Improvements**
   - Modified Debug View to always show all valid components
   - Components remain visible regardless of their active state
   - Maintained 50% opacity for inactive components while preserving debug variable visibility
   - Ensured TabNavigation and StaffDetail remain consistently active
   - Implemented semantic tab names (ShiftTable, StaffList) replacing generic Tab 1/Tab 2
   - Added first-time user detection and default tab handling
   - Maintained instant state changes for better user experience
   - Preserved natural component ordering based on update sequence
   - Enhanced debug variable visibility across all components
   - Maintained real-time updates for both active and inactive components
   - Added timestamps for all state changes
   - Preserved debug information during tab switches
   - Implemented clear active/inactive state indicators
   - Maintained centralized state management through TabNavigation
   - Added proper state persistence for returning users
   - Enhanced first-time user experience

2. **Add Button Visibility Enhancement**
   - Implemented dynamic Add button visibility in StaffList
   - Button now only appears when user starts typing in name field
   - Maintains existing validation (letters and spaces only)
   - Fixed button counting in debug view to accurately track visible buttons

3. **Debug View Improvements**
   - Fixed button counting logic to properly track Add/Remove buttons
   - Changed from using `rowStaffIDs` to using `rows` array for accurate counting
   - Debug view now correctly shows:
     - Number of visible Add buttons (when name field has input)
     - Number of Remove buttons (for added staff members)

### What We're Working On
1. **Staff List Component Improvements**
   - Maintaining simple, clear UI with minimal styling
   - Ensuring proper input field UX
   - Keeping debug tracking accurate and useful

### Recently Completed
1. **Debug View Enhancements**
   - Fixed button counting logic
   - Added timestamps for state updates
   - Improved tracking of important state variables

2. **Table Management**
   - Fixed row management in StaffList
   - Restored proper add/remove functionality
   - Implemented proper row shifting on removal

3. **UI Improvements**
   - Added minimal input field styling (border and padding)
   - Restored helpful placeholder text
   - Implemented dynamic Add button visibility

### Known Issues & Bugs
1. **Table Management**
   - Need to verify if row shifting works correctly after staff removal
   - Need to ensure proper staff count synchronization
   - Need to validate if new rows are added correctly

### Next Steps
1. **High Priority**
   - Test edge cases for Add button visibility
   - Verify debug tracking accuracy for all state variables
   - Ensure proper table width responsiveness

2. **Medium Priority**
   - Review and document state management patterns
   - Consider adding input validation feedback
   - Review accessibility of input fields

3. **Future Improvements**
   - Consider adding undo/redo functionality for staff changes
   - Consider adding bulk staff import/export
   - Consider adding staff data persistence

### Development Guidelines
1. Follow step-by-step development approach
2. Maintain minimal styling unless specifically requested
3. Keep debug tracking up to date
4. Document all significant changes
5. Prioritize stability over feature additions

## 2025-01-27: Implementing Data Persistence and Bug Fixes

### Storage Implementation Progress (08:00)
1. Enhanced `storage.js` utility:
   - Added schema versioning (v1)
   - Implemented migration system
   - Added staff list specific storage
   - Added error handling

2. Integrated localStorage in StaffDetailContext:
   - Auto-saves on staff changes
   - Loads data on component mount
   - Maintains timestamps for changes
   - Preserves editing states

3. Added Debug Visibility:
   - Raw localStorage data view
   - Current staff state tracking
   - Input values monitoring
   - Row mappings and availability

### Bug Fixes (07:52-08:00)
1. Fixed duplicate key warning in Availability component:
   - Changed day identifiers from 'S' to 'Sa'/'Su'
   - Updated WEEKDAYS constant
   - Maintained backward compatibility

2. Resolved infinite update loop:
   - Combined multiple useEffect hooks
   - Optimized state updates
   - Improved debug variable tracking
   - Removed redundant state updates

### Current Implementation Details
1. Data Structure:
   ```javascript
   {
     staffMembers: Array,     // List of staff
     editingStaffId: string,  // Currently edited staff
     lastUpdated: timestamp   // Last modification time
   }
   ```

2. Debug View Sections:
   - StaffDetail: Shows context-level data
   - StaffList: Shows component-level state
   - LocalStorage: Shows persisted data

### Next Steps
1. Test data persistence thoroughly
2. Implement error recovery
3. Add data migration tests
4. Improve debug view organization

### Technical Notes
- Using localStorage for persistence
- Schema versioning for future updates
- Centralized state management
- Debug-first development approach

## [2025-01-27] Enhanced User Feedback with Custom Notifications

### Changes Made
1. **Improved Notification System**
   - Replaced browser alerts with custom styled notifications
   - Notifications now appear in bottom-right corner for better UX
   - Made Notification component more flexible with customizable messages
   - Added proper error handling for invalid staff names

2. **Component Updates**
   - Enhanced `Notification.js` to support custom messages and descriptions
   - Updated `StaffList.js` to use the new notification system
   - Improved validation feedback when editing staff names

3. **User Experience Improvements**
   - More consistent and professional error messages
   - Less intrusive notifications (no blocking alerts)
   - Better visual feedback for validation errors

### Files Modified
- `src/components/Notification.js`
- `src/components/StaffList.js`

### Next Steps
- Consider adding different notification types (success, warning, error)
- Add animations for notification appear/disappear
- Consider notification timeout for auto-dismiss

## Notes
- This document will be updated as we progress
- Priority order may change based on user requirements
- All styling changes require explicit user approval
- Focus on maintaining existing functionality before adding new features
