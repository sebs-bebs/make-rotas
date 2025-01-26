# Variables and Functions Reference

## App Component (`src/App.js`)

### Imports
```javascript
import logo from './logo.svg'
import './App.css'
import Navbar from './components/Navbar'
import TabNavigation from './components/TabNavigation'
```

### Component Structure
- Type: Function Component
- Name: App
- Return: JSX with main layout structure

## Navbar Component (`src/components/Navbar.js`)

### Component Structure
- Type: Arrow Function Component
- Name: Navbar
- Return: Navigation bar with company name

## TabNavigation Component (`src/components/TabNavigation.js`)

### State Variables
```javascript
const [activeTab, setActiveTab] = React.useState("Tab 1")
```
- **activeTab**
  - Type: String
  - Default: "Tab 1"
  - Scope: Component-level state
  - Usage: Controls active tab selection

### State Update Functions
- **setActiveTab**
  - Type: Function
  - Parameters: String
  - Purpose: Updates activeTab state
  - Called by: Tab click handlers

### Event Handlers
- **Tab Click Handler**
  - Type: Inline arrow function
  - Trigger: onClick
  - Action: Updates activeTab state
  - Example: `() => setActiveTab("Tab 1")`

### Return Value
- Type: JSX
- Structure:
  ```jsx
  <div className="tab-navigation">
    <a> Tab 1 </a>
    <a> Tab 2 </a>
  </div>
  ```

## ShiftTable Component (`src/components/ShiftTable.js`)

### State Variables
```javascript
// Week offset tracking
const [weekOffset, setWeekOffset] = useState(0);

// Current week state
const [currentWeekState, setCurrentWeek] = useState(() => ({
  id: mondayDate,
  startDate: new Date(mondayDate),
  dates: getWeekDates(mondayDate)
}));

// Table rows state
const [rows, setRows] = useState(() => [
  {
    id: 'row-1',
    cells: ['STAFF', ...Array(numColumns - 1).fill('')]
  },
  {
    id: 'row-2',
    cells: ['C1R2', ...Array(numColumns - 1).fill('')]
  }
]);
```

### Memoized Values
```javascript
// Week days information
const weekDays = useMemo(() => ({
  monday: { date: mon, week: weekOffset, isCurrentWeek: weekOffset === 0, dayName: 'Monday' },
  tuesday: { date: tue, week: weekOffset, isCurrentWeek: weekOffset === 0, dayName: 'Tuesday' },
  wednesday: { date: wed, week: weekOffset, isCurrentWeek: weekOffset === 0, dayName: 'Wednesday' },
  thursday: { date: thu, week: weekOffset, isCurrentWeek: weekOffset === 0, dayName: 'Thursday' },
  friday: { date: fri, week: weekOffset, isCurrentWeek: weekOffset === 0, dayName: 'Friday' },
  saturday: { date: sat, week: weekOffset, isCurrentWeek: weekOffset === 0, dayName: 'Saturday' },
  sunday: { date: sun, week: weekOffset, isCurrentWeek: weekOffset === 0, dayName: 'Sunday' }
}), [currentWeekState.dates, weekOffset]);
```

### Callback Functions
```javascript
// Navigate between weeks
const navigateWeek = useCallback((direction) => {
  const newOffset = weekOffset + (direction === 'next' ? 1 : -1);
  setWeekOffset(newOffset);
  // ... update week state
}, [weekOffset, currentDate, getMondayOfWeek, getWeekDates]);

// Reset to current week
const goToCurrentWeek = useCallback(() => {
  setWeekOffset(0);
  // ... reset week state
}, [getCurrentMonday, getWeekDates]);

// Check if a date is today
const isCurrentDay = useCallback((date) => {
  return date === currentDate;
}, [currentDate]);

// Check if a date is in the future
const isFutureDate = useCallback((date) => {
  return new Date(date) > new Date(currentDate);
}, [currentDate]);
```

### Helper Functions
```javascript
// Check if an element has frozen styling
const isElementFrozen = useCallback((element) => {
  if (!element) return false;
  const style = window.getComputedStyle(element);
  return style.position === 'sticky' && 
         (style.top === '0px' || style.left === '0px') &&
         style.backgroundColor !== 'transparent' &&
         parseInt(style.zIndex) > 0;
}, []);

// Count frozen rows
const getFrozenRowCount = useCallback(() => {
  return rows.reduce((count, _, index) => 
    count + (isRowFrozen(index) ? 1 : 0), 0);
}, [rows, isRowFrozen]);

// Count frozen columns
const getFrozenColumnCount = useCallback(() => {
  return rows[0]?.cells.reduce((count, _, index) => 
    count + (isColumnFrozen(index) ? 1 : 0), 0) || 0;
}, [rows, isColumnFrozen]);
```

## StaffDetailContext (`src/context/StaffDetailContext.js`)

### StaffMember Object Structure
```typescript
interface StaffMember {
  firstName: string;     // First name of staff member
  lastName: string;      // Last name of staff member
  fullName: string;      // Auto-computed: firstName + lastName
  role: string;         // Staff member's role
  comments: string;     // Additional notes
  staffID: string;      // Unique identifier
  availability: string[]; // Available days
  inList: boolean;      // Active status
}
```

### Context Functions

#### useStaffDetail Hook
```javascript
const { 
  staffMembers,          // All staff members array
  addStaffMember,        // Add new staff member
  updateStaffMember,     // Update existing staff member
  removeStaffMember,     // Soft delete staff member
  getStaffMember,        // Get single staff member
  getActiveStaffMembers  // Get all active staff
} = useStaffDetail();
```

#### Add Staff Member
```javascript
addStaffMember({
  firstName: "John",
  lastName: "Doe",
  role: "Chef",
  comments: "Senior chef",
  staffID: "chef_001",
  availability: ["Monday", "Tuesday"]
});
// Note: fullName and inList are auto-set
```

#### Update Staff Member
```javascript
updateStaffMember("chef_001", {
  role: "Head Chef",
  availability: ["Monday", "Wednesday"]
});
// Note: fullName updates automatically if name changes
```

#### Remove Staff Member
```javascript
removeStaffMember("chef_001");
// Sets inList to false, keeping record in system
```

#### Get Staff Members
```javascript
// Get single staff member
const chef = getStaffMember("chef_001");

// Get all active staff members
const activeStaff = getActiveStaffMembers();
```

### Implementation Notes
- Uses React Context for global state management
- Maintains soft delete functionality
- Automatically computes and syncs fullName
- Preserves data integrity with TypeScript-like validation
- Provides comprehensive CRUD operations
- Available throughout the application via useStaffDetail hook

## DateContext (`src/context/DateContext.js`)

### Helper Functions
```javascript
// Get Monday of any week
const getMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

// Format date to YYYY-MM-DD
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

// Get array of dates for a week
const getWeekDates = (mondayDate) => {
  const dates = [];
  const startDate = new Date(mondayDate);
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(formatDate(date));
  }
  return dates;
};
```

## Debug System (`src/hooks/useDebugTracker.js`)

### Hook Functions
```javascript
const useDebugTracker = (initialVariables = {}) => {
  const [debugVariables, setDebugVariables] = useState(initialVariables);

  const trackVariable = useCallback((key, newValue) => {
    setDebugVariables(prev => {
      if (prev[key]?.value === newValue) return prev;
      return {
        ...prev,
        [key]: {
          value: newValue,
          lastUpdated: new Date().toLocaleTimeString(),
          type: typeof newValue,
        }
      };
    });
  }, []);

  return { debugVariables, trackVariable };
};
```

## Debug Tips
1. Check activeTab value in React DevTools under TabNavigation
2. Monitor tab click events in browser console
3. Verify state updates are triggering re-renders
4. Check CSS classes application based on activeTab value

## Future Considerations
- Document any new state variables here
- Track side effects (useEffect hooks)
- List custom hooks when added
- Document context providers if implemented
- Track any Redux/global state integration
- Document any new hooks when added
- Track any new context providers
- Document any new utility functions
- Track changes to existing functions
- Document any new state management patterns
