// src/utils/dateFormatter.js

/**
 * Formats a Date object to a string with abbreviated month names.
 * @param {Date} date - The date to format.
 * @param {string} format - The format string. Use 'MMM' for abbreviated month names.
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
  
    // Replace 'MMM' with the abbreviated month name
    let formattedDate = format;
    formattedDate = formattedDate.replace('MMM', monthNames[monthIndex]);
    formattedDate = formattedDate.replace('dd', day.toString().padStart(2, '0'));
    formattedDate = formattedDate.replace('yyyy', year.toString());
  
    return formattedDate;
  }