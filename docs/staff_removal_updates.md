# Staff Removal Feature Documentation Updates

This document contains the updates that should be made to existing documentation files to reflect the new staff removal functionality added to the ShiftTable component on 2025-03-12.

## Updates for `recent_progress.md`

Add this section at the beginning:

```markdown
## Current Focus (as of 2025-03-12)

### Staff Removal from Rota Feature Implementation
1. **Feature Overview**
   - Implemented ability to remove staff from the rota with a dedicated button
   - Added new action column to ShiftTable to display removal controls
   - Integrated with existing RemoveButton component for consistent UX
   - Added notification system for confirming staff removals
   - Maintained the same table structure without affecting layout

2. **Component Implementation**
   - **RemoveButton**
     - Reused existing RemoveButton component 
     - Maintained modular design for consistent UI across application
     - Kept same functionality as used in StaffList
   
   - **ShiftTable**
     - Added dedicated action column for removal controls
     - Implemented staff removal logic with proper state updates
     - Integrated with notification system
     - Updated localStorage persistence to track removals
     - Added proper debug variable tracking

3. **User Experience Improvements**
   - Added clear visual indication of removal action
   - Temporary notification appears when staff removed
   - Removal action only available for actual staff rows (not headers or add staff row)
   - Consistent user interface with other removal actions in the application
```

## Updates for `shiftTable_documentation.md`

Add this section to the Component Capabilities section:

```markdown
### Staff Management

#### Staff Removal (added 2025-03-12)
- Remove staff from rota with dedicated button
- Display in separate action column
- Show notification on successful removal
- Update localStorage data
- Reuse existing RemoveButton component

Implementation:
```javascript
const handleRemoveStaff = useCallback((rowId) => {
  // Find the row index
  const rowIndex = rows.findIndex(row => row.id === rowId);
  if (rowIndex === -1 || rowId === 'row-1' || rowId === 'row-2') return;

  // Get staff info for debug
  const staffId = rowStaffIDs[rowId];
  const staffName = rows[rowIndex].cells[0];

  // Remove row from rows
  setRows(currentRows => {
    return currentRows.filter(row => row.id !== rowId);
  });

  // Remove from staff IDs tracking
  setRowStaffIDs(prev => {
    const newRowStaffIDs = { ...prev };
    delete newRowStaffIDs[rowId];
    return newRowStaffIDs;
  });

  // Show notification
  setNotification(`${staffName} removed from rota`);

  // Track in debug
  updateDebugVariables({
    ShiftTable: {
      staffRemoved: {
        value: staffName,
        lastUpdated: new Date().toLocaleTimeString(),
        type: "string"
      },
      totalRows: {
        value: rows.length - 1, 
        lastUpdated: new Date().toLocaleTimeString(),
        type: "number"
      }
    }
  });
}, [rows, rowStaffIDs, updateDebugVariables]);
```
```

## Updates for `feature.md`

Add this section to the Feature Implementation Log:

```markdown
## ShiftTable Component - Staff Removal Feature (2025-03-12)

### Overview
The ShiftTable component has been enhanced with staff removal functionality, allowing users to remove staff members from the rota.

### Implementation Details
```jsx
// Added RemoveButton import
import RemoveButton from './RemoveButton';

// Added staff removal handler function
const handleRemoveStaff = useCallback((rowId) => {
  // Find row and remove from state
  // Update localStorage
  // Show notification
  // Update debug variables
}, [rows, rowStaffIDs, updateDebugVariables]);

// Added action column to table with RemoveButton
<td key={`${row.id}-action`} className="border p-2 min-w-[100px]">
  {rowIndex === 0 ? (
    'ACTIONS'
  ) : row.id === 'row-2' ? (
    ''
  ) : (
    <RemoveButton onRemove={() => handleRemoveStaff(row.id)} />
  )}
</td>
```

### Key Features
1. **Reusable Components**
   - Leverages existing RemoveButton component
   - Maintains consistent UI with StaffList component
   - No additional styling required

2. **State Management**
   - Updates rows state to remove staff row
   - Updates rowStaffIDs to remove staff ID mapping
   - Persists changes to localStorage

3. **User Experience**
   - Shows notification when staff is removed
   - Only displays remove button for staff rows (not header or add row)
   - Adds "ACTIONS" column header for clarity

4. **Debug Integration**
   - Tracks staff removal in debug variables
   - Updates total row count
   - Records staff name that was removed
```

## Updates for `variables_and_functions.md`

Add this to the ShiftTable Component Callback Functions section:

```markdown
// Remove staff from rota
const handleRemoveStaff = useCallback((rowId) => {
  // Find the row index
  const rowIndex = rows.findIndex(row => row.id === rowId);
  if (rowIndex === -1 || rowId === 'row-1' || rowId === 'row-2') return; 

  // Get staff info for debug
  const staffId = rowStaffIDs[rowId];
  const staffName = rows[rowIndex].cells[0];

  // Remove from state and update localStorage
  setRows(currentRows => currentRows.filter(row => row.id !== rowId));
  setRowStaffIDs(prev => {
    const newRowStaffIDs = { ...prev };
    delete newRowStaffIDs[rowId];
    return newRowStaffIDs;
  });

  // Show notification and update debug
  setNotification(`${staffName} removed from rota`);
  updateDebugVariables({
    ShiftTable: {
      staffRemoved: { value: staffName, type: "string" },
      totalRows: { value: rows.length - 1, type: "number" }
    }
  });
}, [rows, rowStaffIDs, updateDebugVariables]);
```
