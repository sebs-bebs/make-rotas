// src/utils/dateFormatter.js

/**
 * Formats a Date object to a string with abbreviated month names or numeric months.
 * @param {Date} date - The date to format.
 * @param {string} format - The format string. Use 'MMM' for abbreviated month names or 'MM' for numeric months.
 * @returns {string} - The formatted date string.
 */
export function formatDateWithAbbreviatedMonth(date, format = 'MMM dd, yyyy') {
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
  
    let formattedDate = format;
    // Handle both abbreviated and numeric month formats
    if (format.includes('MMM')) {
      formattedDate = formattedDate.replace('MMM', monthNames[monthIndex]);
    } else if (format.includes('MM')) {
      formattedDate = formattedDate.replace('MM', (monthIndex + 1).toString().padStart(2, '0'));
    }
    formattedDate = formattedDate.replace('dd', day.toString().padStart(2, '0'));
    formattedDate = formattedDate.replace('yyyy', year.toString());
    // Ensure 'yy' format is supported for two-digit year
    formattedDate = formattedDate.replace('yy', year.toString().slice(-2));
    
    return formattedDate;
  }