/**
 * Test Data Generator
 * 
 * This utility generates realistic test data for the StaffList and ShiftTable components
 * using the application's actual storage functions to ensure full compatibility.
 */

import { saveStaffListData } from './storage';

// Sample data sets for random generation
const FIRST_NAMES = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles',
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen',
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Avery', 'Quinn', 'Reese'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor',
  'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson',
  'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'Hernandez', 'King'
];

const ROLES = [
  'Bar Staff', 'Waiter', 'Waitress', 'Chef', 'Kitchen Porter', 'Host', 'Hostess', 'Manager',
  'Assistant Manager', 'Barista', 'Bartender', 'Supervisor', 'Server', 'Cleaner', 'Security'
];

const COMMENTS = [
  'Available weekends only', 'Prefers morning shifts', 'Student - available evenings',
  'Experienced', 'Trainee', 'Part-time', 'Full-time', 'Flexible hours',
  'Prefers not to work Sundays', 'Can cover emergency shifts', 'Studying hospitality',
  'Second job', 'Transportation limitations', 'Reliable', 'Good with customers'
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Generate a random staff ID
 * @returns {string} A unique staff ID
 */
function generateStaffID() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `staff_${timestamp}${random}`;
}

/**
 * Pick random items from an array
 * @param {Array} array - The array to pick from
 * @param {number} count - How many items to pick
 * @returns {Array} - The picked items
 */
function pickRandom(array, count = 1) {
  const result = [];
  const arrayCopy = [...array];
  
  // If count is greater than array length, return whole array
  if (count >= array.length) return arrayCopy;
  
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * arrayCopy.length);
    result.push(arrayCopy[randomIndex]);
    arrayCopy.splice(randomIndex, 1);
  }
  
  return result;
}

/**
 * Generate a random person's full name
 * @returns {string} - A random full name
 */
function generateRandomName() {
  const firstName = pickRandom(FIRST_NAMES)[0];
  const lastName = pickRandom(LAST_NAMES)[0];
  return `${firstName} ${lastName}`;
}

/**
 * Generate random availability days
 * @returns {string[]} - Array of available days
 */
function generateRandomAvailability() {
  // Random number of days between 3 and 7
  const numDays = Math.floor(Math.random() * 5) + 3;
  return pickRandom(DAYS_OF_WEEK, numDays);
}

/**
 * Generate random time in 24-hour format
 * @param {number} minHour - Minimum hour (0-23)
 * @param {number} maxHour - Maximum hour (0-23)
 * @returns {string} - Time in format "HH:MM"
 */
function generateRandomTime(minHour = 8, maxHour = 22) {
  const hour = Math.floor(Math.random() * (maxHour - minHour + 1)) + minHour;
  // Only use 00, 15, 30, or 45 for minutes
  const minuteOptions = [0, 15, 30, 45];
  const minute = minuteOptions[Math.floor(Math.random() * minuteOptions.length)];
  
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

/**
 * Generate random shift times
 * @returns {Object} - Object with startTime and endTime
 */
function generateRandomShift() {
  const startHour = Math.floor(Math.random() * 10) + 8; // Between 8 AM and 6 PM
  const startTime = generateRandomTime(startHour, startHour);
  
  // Shift length between 4-8 hours
  const shiftLength = Math.floor(Math.random() * 5) + 4;
  const endHour = Math.min(startHour + shiftLength, 23);
  const endTime = generateRandomTime(endHour, endHour);
  
  return { startTime, endTime };
}

/**
 * Create test staff data
 * @param {number} count - Number of staff to generate
 * @returns {Array} Generated staff members
 */
function createTestStaffData(count = 50) {
  const staffMembers = [];
  
  // Generate random staff members
  for (let i = 0; i < count; i++) {
    const staffMember = {
      staffID: generateStaffID(),
      fullName: generateRandomName(),
      role: pickRandom(ROLES)[0],
      comments: pickRandom(COMMENTS)[0],
      availability: generateRandomAvailability(),
      inList: true,
      state: 'SAVED'
    };
    
    staffMembers.push(staffMember);
  }
  
  console.log(`Created ${staffMembers.length} test staff members`);
  return staffMembers;
}

/**
 * Generate staff data and save using the application's storage functions
 * @param {number} count - Number of staff to generate
 */
async function generateStaffData(count = 50) {
  try {
    // Clear existing storage first
    localStorage.clear();
    console.log('Cleared existing localStorage data');
    
    // Generate staff members
    const staffMembers = createTestStaffData(count);
    
    // Save using the application's storage function - uses staff_list_data key
    const dataToSave = {
      staffMembers,
      lastUpdated: new Date().toISOString()
    };
    
    await saveStaffListData(dataToSave);
    console.log('Successfully saved staff data using application storage function');
    
    // Additionally save each staff member individually with the correct prefix - uses staff_<ID> keys
    // This ensures both StaffList and ShiftTable can find the data
    staffMembers.forEach(staff => {
      const key = `staff_${staff.staffID}`;
      localStorage.setItem(key, JSON.stringify(staff));
    });
    console.log('Saved each staff member with individual keys for StaffList compatibility');
    
    // Also save the staff_list key which contains an array of staff IDs
    // This is needed for the staffData.js loadAllStaffMembers function
    const staffIds = staffMembers.map(staff => staff.staffID);
    localStorage.setItem('staff_list', JSON.stringify(staffIds));
    console.log('Saved staff_list with all staff IDs');
    
    // Direct save for StaffDetail context - this is critical!
    // Must match the exact format expected by the StaffDetailContext
    localStorage.setItem('staff_list_data', JSON.stringify({
      version: 1,
      data: {
        staffMembers,
        lastUpdated: new Date().toISOString()
      },
      updatedAt: new Date().toISOString()
    }));
    console.log('Saved direct staff_list_data for StaffDetailContext with correct structure');
    
    // For ShiftTable, we also need to set up some basic structures
    setupShiftTableData(staffMembers);
    
    return {
      success: true,
      count: staffMembers.length,
      message: 'Data generation complete'
    };
  } catch (error) {
    console.error('Error generating staff data:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Set up shift table data structures
 * @param {Array} staffMembers - Staff members to create shifts for
 */
function setupShiftTableData(staffMembers) {
  try {
    // Get current Monday date
    const getCurrentMonday = () => {
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(now.setDate(diff)).toISOString().split('T')[0];
    };
    
    // Get dates for a specific week
    const getWeekDates = (mondayDate) => {
      const dates = [];
      const monday = new Date(mondayDate);
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(date.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }
      
      return dates;
    };
    
    const currentMonday = getCurrentMonday();
    const weekDates = getWeekDates(currentMonday);
    
    // 1. Create basic rows structure
    const headerRow = {
      id: 'row-1',
      cells: [
        'STAFF',
        `Monday\n${weekDates[0]}`,
        `Tuesday\n${weekDates[1]}`,
        `Wednesday\n${weekDates[2]}`,
        `Thursday\n${weekDates[3]}`,
        `Friday\n${weekDates[4]}`,
        `Saturday\n${weekDates[5]}`,
        `Sunday\n${weekDates[6]}`
      ],
      weekStartDate: currentMonday
    };
    
    // Create staff rows
    const staffRows = staffMembers.map(staff => {
      const rowId = `row-staff-${staff.fullName.replace(/\s+/g, '-').toLowerCase()}`;
      return {
        id: rowId,
        cells: [staff.fullName, ...Array(7).fill('')],
        weekStartDate: currentMonday
      };
    });
    
    // Add staff row
    const addStaffRow = {
      id: 'row-2',
      cells: ['Add Staff', ...Array(7).fill('')],
      weekStartDate: currentMonday
    };
    
    const allRows = [headerRow, ...staffRows, addStaffRow];
    
    // 2. Create row-to-staff-ID mapping
    const staffIDMapping = {};
    staffMembers.forEach(staff => {
      const rowId = `row-staff-${staff.fullName.replace(/\s+/g, '-').toLowerCase()}`;
      staffIDMapping[rowId] = staff.staffID;
    });
    
    // 3. Create shift data
    const shiftData = {};
    
    // Generate shifts for each staff member
    staffMembers.forEach(staff => {
      // Generate shifts based on availability
      const availability = staff.availability || DAYS_OF_WEEK;
      
      DAYS_OF_WEEK.forEach((day, index) => {
        // 70% chance of having a shift if available
        if (availability.includes(day) && Math.random() > 0.3) {
          const { startTime, endTime } = generateRandomShift();
          
          // Format: staffName_day_weekStartDate
          const shiftKey = `${staff.fullName}_${day}_${currentMonday}`;
          
          shiftData[shiftKey] = {
            startTime,
            endTime,
            weekStartDate: currentMonday,
            lastUpdated: new Date().toISOString()
          };
        }
      });
    });
    
    // 4. Store in localStorage
    const rowsByWeek = { [currentMonday]: allRows };
    
    localStorage.setItem('shiftTableRowsByWeek', JSON.stringify(rowsByWeek));
    localStorage.setItem('shiftTableStaffIDs', JSON.stringify(staffIDMapping));
    localStorage.setItem('shiftTableShiftData', JSON.stringify(shiftData));
    
    // 5. Create shiftTableStaffByWeek to ensure staff names are in the table
    const staffByWeek = { [currentMonday]: staffMembers.map(staff => staff.fullName) };
    localStorage.setItem('shiftTableStaffByWeek', JSON.stringify(staffByWeek));
    
    console.log(`Set up shift table data for ${staffMembers.length} staff members`);
  } catch (error) {
    console.error('Error setting up shift table data:', error);
  }
}

/**
 * Generate all test data
 * @param {number} staffCount - Number of staff to generate
 */
async function generateAllTestData(staffCount = 50) {
  console.log(`Generating ${staffCount} staff members with shifts...`);
  
  try {
    // Clear existing storage first
    localStorage.clear();
    console.log('Cleared existing localStorage data');
    
    // Generate staff members
    const staffMembers = createTestStaffData(staffCount);
    
    // CRITICAL FIX: Save in EXACT format expected by StaffDetailContext
    // This is the root cause of the issue - format mismatch between components
    localStorage.setItem('staff_list_data', JSON.stringify({
      version: 1,
      data: {
        staffMembers: staffMembers,
        editingStaffId: null,
        lastUpdated: new Date().toISOString()
      },
      updatedAt: new Date().toISOString()
    }));
    console.log('Saved staff_list_data with exact structure expected by StaffDetailContext');
    
    // Also save each staff member individually (used by StaffDetailProvider)
    staffMembers.forEach(staff => {
      const key = `staff_${staff.staffID}`;
      localStorage.setItem(key, JSON.stringify(staff));
    });
    
    // Set up ShiftTable data structures separately
    setupShiftTableData(staffMembers);
    
    // Force reload to ensure all contexts pick up the new data
    window.location.reload();
    
    return {
      success: true,
      staffCount: staffCount,
      message: 'Test data generation complete and page reloaded!'
    };
  } catch (error) {
    console.error('Error in generateAllTestData:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Export functions for use in browser console
window.generateTestData = {
  generateStaffData,
  generateAllTestData
};

// Export functions for module imports
export {
  generateStaffData,
  generateAllTestData
};
