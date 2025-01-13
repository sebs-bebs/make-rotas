export function calculateWeeklyHours(shifts = []) {
    let total = 0;
    shifts.forEach((shift) => {
      if (shift.toUpperCase() === 'OFF') return;
      // shift format: "HH:MM - HH:MM"
      const parts = shift.split('-').map((part) => part.trim());
      if (parts.length !== 2) return;
      const start = parseTime(parts[0]);
      const end = parseTime(parts[1]);
      if (start != null && end != null) {
        total += end - start;
      }
    });
    return total;
  }
  
  // parseTime("12:00") -> 12, parseTime("20:30") -> 20.5
  function parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map((x) => parseInt(x, 10));
    if (isNaN(hours) || isNaN(minutes)) return null;
    return hours + minutes / 60;
  }
  