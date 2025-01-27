// Day names in short format (unique identifiers)
export const WEEKDAYS = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'];

// Full day names (for accessibility and screen readers)
export const FULL_WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Map short names to full names (like a translator)
export const DAY_NAME_MAP = {
    'M': 'Monday',     // If we see 'M', it means 'Monday'
    'T': 'Tuesday',    // If we see 'T', it means 'Tuesday'
    'W': 'Wednesday',  // If we see 'W', it means 'Wednesday'
    'Th': 'Thursday',  // If we see 'Th', it means 'Thursday'
    'F': 'Friday',     // If we see 'F', it means 'Friday'
    'Sa': 'Saturday',  // Using 'Sa' for Saturday
    'Su': 'Sunday'     // Using 'Su' for Sunday
};

// Examples of how this works:
// When we store availability: ['M', 'W', 'F']
// When we need to display it: ['Monday', 'Wednesday', 'Friday']
// We use DAY_NAME_MAP to convert between them
