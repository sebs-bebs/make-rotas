# Make-Rotas Data Flow Diagram (March 15, 2025)

This document outlines the data flow in the Make-Rotas application, with special focus on the week-specific staff assignment implementation.

## Core Data Entities

- **Staff Member**: Individual staff data with properties like `staffID`, `fullName`, `role`, `comments`, `availability`, `inList`, and `state`.
- **Week-Specific Staff**: Staff assigned to specific weeks by their start date.
- **Shift Data**: Represents shifts in the ShiftTable, linked to specific staff members and weeks.
- **Debug Variables**: Dynamic collection of component-specific states for development.

## Data Storage Structure

```mermaid
graph TD
    A[localStorage] --> B[shiftTableStaff]
    A --> C[shiftTableStaffByWeek]
    A --> D[shiftTableShiftData]
    A --> E[shiftTableRowsByWeek]
    A --> F[staffListData]
    
    B[shiftTableStaff] --> B1["Array of all staff names"]
    
    C[shiftTableStaffByWeek] --> C1["Object with week dates as keys"]
    C1 --> C2["Arrays of staff names for each week"]
    
    D[shiftTableShiftData] --> D1["Object with staffName_day_weekStartDate keys"]
    D1 --> D2["Shift objects with start/end times"]
    
    E[shiftTableRowsByWeek] --> E1["Object with week dates as keys"]
    E1 --> E2["Arrays of row objects for each week"]
    
    F[staffListData] --> F1["Array of staff member objects"]
```

## Week-Specific Staff Flow

```mermaid
sequenceDiagram
    participant U as User
    participant ST as ShiftTable Component
    participant DC as Date Context
    participant LS as localStorage
    
    U->>DC: Navigate to different week
    DC->>ST: Update currentWeekState
    ST->>ST: useEffect triggered by week change
    ST->>LS: Get staffByWeek data
    LS-->>ST: Return staff for specified week
    ST->>ST: Build rows with week-specific staff
    ST->>U: Render updated table with only<br>staff assigned to current week
    
    U->>ST: Click "Add Staff"
    ST->>ST: Open staff selector
    U->>ST: Select staff to add
    ST->>LS: Update shiftTableStaffByWeek<br>for current week only
    ST->>LS: Update global shiftTableStaff list
    ST->>ST: Update UI with new staff row
    ST->>U: Show notification

    U->>ST: Click "Remove Staff"
    ST->>LS: Remove staff from current week only
    ST->>LS: Remove associated shifts
    ST->>ST: Update UI to remove staff row
    ST->>U: Show notification
```

## Shift Data Flow

```mermaid
flowchart TD
    A[User clicks on shift cell] --> B{Shift exists?}
    B -->|Yes| C[Open shift editor with<br>existing data]
    B -->|No| D[Open shift editor with<br>default values]
    
    C --> E[User edits shift]
    D --> E
    
    E --> F[handleShiftChange called]
    F --> G[Create week-specific key:<br>staffName_day_weekStartDate]
    G --> H[Update shiftData state]
    H --> I[Store in localStorage]
    I --> J[Update UI]
```

## Component Hierarchy and Data Flow

```mermaid
graph TD
    A[App] --> B[DateProvider]
    A --> C[DebugProvider]
    A --> D[StaffProvider]
    A --> E[StaffDetailProvider]
    
    B --> F[ShiftTable]
    C --> F
    D --> F
    E --> F
    
    F --> G[ShiftSlot]
    F --> H[StaffSelector]
    F --> I[ShiftEditor]
    
    G --> J[Week-specific<br>shift data]
    H --> K[Staff selection<br>filtered by week]
    I --> L[Shift editing<br>for specific week]
```

## Improved Week-Specific Implementation

The core improvement to the data structure is the separation of staff assignments by week. This is achieved through several key mechanisms:

1. **Week-Specific Staff Storage**:
   - Staff assignments are stored in `shiftTableStaffByWeek` as an object with week start dates as keys
   - Each key contains an array of staff names assigned to that specific week

2. **Direct Week Navigation Updates**:
   - When changing weeks, the component directly loads only staff for that week
   - Each row is explicitly tagged with `weekStartDate` to maintain week association

3. **Isolated Staff Operations**:
   - Adding staff only affects the current week's data
   - Removing staff only removes them from the current week
   - Shift data is linked to specific weeks through composite keys

4. **Week-Specific Key Format**:
   - Shift data uses keys in the format `staffName_day_weekStartDate`
   - This ensures shifts are only visible in their assigned week

## Debug and Error Handling

The application includes detailed logging and error handling:

```javascript
try {
  // Get staff for this specific week
  const staffByWeek = JSON.parse(localStorage.getItem('shiftTableStaffByWeek') || '{}');
  const staffForThisWeek = staffByWeek[weekStartDate] || [];
  
  console.log('📊 DIRECT WEEK UPDATE: Found staff for this week:', {
    week: weekStartDate,
    staffCount: staffForThisWeek.length,
    staff: staffForThisWeek
  });
  
  // Process and render staff...
} catch (error) {
  console.error('❌ DIRECT WEEK UPDATE: Error loading staff for week:', error);
  // Fallback to clean slate...
}
```

This approach ensures that the application maintains a clear separation of staff assignments by week, preventing staff from appearing in weeks they shouldn't be in.
