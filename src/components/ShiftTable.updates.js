// Add this to the imports at the top of ShiftTable.js
import ShiftSlot from './ShiftSlot';

// Add this state variable after the other useState declarations
  // Track shift data for each staff member
  const [shiftData, setShiftData] = useState(() => {
    const savedShiftData = localStorage.getItem('shiftTableShiftData');
    return savedShiftData ? JSON.parse(savedShiftData) : {};
  });

// Add this effect to save shift data to localStorage
  // Save shift data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('shiftTableShiftData', JSON.stringify(shiftData));
  }, [shiftData]);

// Add this handler function for shift changes
  // Handle shift time changes
  const handleShiftChange = useCallback((staffName, day, startTime, endTime) => {
    // Update shift data
    setShiftData(prev => ({
      ...prev,
      [`${staffName}_${day}`]: {
        startTime,
        endTime,
        lastUpdated: new Date().toISOString()
      }
    }));
    
    // Calculate duration if both times are set
    if (startTime && endTime) {
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;
      
      const durationMinutes = endTotalMinutes - startTotalMinutes;
      const hours = Math.floor(durationMinutes / 60);
      
      // Track in debug
      updateDebugVariables({
        ShiftTable: {
          [`${staffName}_shifts`]: {
            value: {
              ...prev?.[`${staffName}_shifts`]?.value || {},
              [day]: {
                startTime,
                endTime,
                duration: `${hours} ${hours === 1 ? 'hour' : 'hours'}`
              }
            },
            lastUpdated: new Date().toLocaleTimeString(),
            type: "object"
          }
        }
      });
    }
  }, [updateDebugVariables]);

// Modify the cell rendering logic in the table to use ShiftSlot for empty cells
// This should replace the existing code where cells are rendered
// The key changes are in the ternary operator deciding what to render in each cell

/*
Inside the table rendering code, replace:

{isAddStaffRow && colIndex === 0 ? (
  <AddStaffButton onClick={handleAddStaffClick} />
) : (
  cell
)}

With this:

{isAddStaffRow && colIndex === 0 ? (
  <AddStaffButton onClick={handleAddStaffClick} />
) : isFirstRow || colIndex === 0 ? (
  cell
) : (!isFirstRow && !isAddStaffRow) ? (
  <ShiftSlot
    staffName={rows[rowIndex].cells[0]}
    day={rows[0].cells[colIndex].split('\n')[0]} // Get day name from header
    rowId={row.id}
    colIndex={colIndex}
    onShiftChange={handleShiftChange}
  />
) : (
  cell
)}
*/
