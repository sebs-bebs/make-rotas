// Add to your imports at the top of the file
import ShiftSlot from './ShiftSlot';

// Add this state variable after your other useState declarations
  // Track shift data for each staff member
  const [shiftData, setShiftData] = useState(() => {
    const savedShiftData = localStorage.getItem('shiftTableShiftData');
    return savedShiftData ? JSON.parse(savedShiftData) : {};
  });

// Add this useEffect to save shift data
  // Save shift data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('shiftTableShiftData', JSON.stringify(shiftData));
  }, [shiftData]);

// Add this useEffect for component activation
  // Update debug variables when component mounts
  useEffect(() => {
    updateDebugVariables({
      ShiftTable: {
        isActive: {
          value: true,
          lastUpdated: new Date().toLocaleTimeString(),
          type: "boolean",
          description: "Component is currently mounted and active"
        }
      }
    });
    
    // Clean up when component unmounts
    return () => {
      updateDebugVariables({
        ShiftTable: {
          isActive: {
            value: false,
            lastUpdated: new Date().toLocaleTimeString(),
            type: "boolean",
            description: "Component is unmounted"
          }
        }
      });
    };
  }, [updateDebugVariables]);

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
          staffShifts: {
            value: {
              ...(debugVariables?.ShiftTable?.staffShifts?.value || {}),
              [staffName]: {
                ...(debugVariables?.ShiftTable?.staffShifts?.value?.[staffName] || {}),
                [day]: {
                  startTime,
                  endTime,
                  duration: `${hours} ${hours === 1 ? 'hour' : 'hours'}`
                }
              }
            },
            lastUpdated: new Date().toLocaleTimeString(),
            type: "object",
            description: "Staff shift schedules"
          }
        }
      });
    }
  }, [updateDebugVariables, debugVariables?.ShiftTable?.staffShifts?.value]);

// Replace this part in your table cell rendering
/*
{isAddStaffRow && colIndex === 0 ? (
  <AddStaffButton onClick={handleAddStaffClick} />
) : (
  cell
)}
*/

// with this:
/*
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
