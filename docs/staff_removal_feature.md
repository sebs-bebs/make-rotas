# Staff Removal Feature Documentation

## Overview
The Staff Removal Feature allows users to remove staff members from the rota in the ShiftTable component. This feature complements the existing staff addition functionality, providing a complete staff management solution within the rota interface.

## Implementation Details

### Component Integration
- **RemoveButton Component**: Reused the existing RemoveButton component to maintain UI consistency across the application
- **ShiftTable Component**: Added a new action column and staff removal logic
- **No Styling Changes**: Maintained existing table layout and design without additional styling

### Key Features
1. **Dedicated Action Column**
   - Added to ShiftTable for housing removal controls
   - Header shows "ACTIONS" label
   - Empty cell for Add Staff row to maintain structure

2. **Staff Removal Logic**
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

3. **User Notifications**
   - Temporary notification appears when staff is removed
   - Shows staff name to confirm which staff was removed

4. **Debug Integration**
   - Tracks staff removal events
   - Updates row count in debug variables
   - Maintains staff ID tracking

### Local Storage Integration
- Updates `shiftTableRows` by removing the staff row
- Updates `shiftTableStaffIDs` by removing the entry for the staff ID
- Maintains automatic localStorage persistence through existing effect hooks

### Interface Changes
1. **Table Structure**
   ```jsx
   <table>
     <tbody>
       <tr> {/* Header Row */}
         <td>STAFF</td>
         <td>Monday</td>
         {/* ... other days */}
         <td>ACTIONS</td> {/* New header for actions */}
       </tr>
       {/* Staff rows with Remove button in last column */}
       <tr>
         <td>John Smith</td>
         {/* ... shift cells */}
         <td><RemoveButton onRemove={() => handleRemoveStaff(row.id)} /></td>
       </tr>
       <tr> {/* Add Staff Row */}
         <td><AddStaffButton /></td>
         {/* ... empty cells */}
         <td></td> {/* Empty cell for actions */}
       </tr>
     </tbody>
   </table>
   ```

## Usage
- Click the "Remove" button in the actions column to remove that staff member from the rota
- A notification will appear confirming the removal
- The staff entry is completely removed from the table
- The staff member becomes available for selection in the StaffSelector for future additions

## Implementation Date
2025-03-12
