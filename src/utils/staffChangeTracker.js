/**
 * Utilities for tracking meaningful staff changes
 */

/**
 * Compare two staff objects to see if anything actually changed
 * Like comparing two versions of a document to see if any real edits were made
 */
export const hasActualChanges = (originalStaff, newStaff) => {
  // If either is missing, no comparison possible
  if (!originalStaff || !newStaff) {
    return false;
  }

  // List of fields we care about
  const importantFields = [
    'fullName',
    'role',
    'availability',
    'comments'
  ];

  // Check each field
  return importantFields.some(field => {
    const oldValue = originalStaff[field];
    const newValue = newStaff[field];

    // Handle arrays (like availability)
    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      if (oldValue.length !== newValue.length) return true;
      return oldValue.some((day, index) => day !== newValue[index]);
    }

    // Handle regular values
    return oldValue !== newValue;
  });
};

/**
 * Create a description of what changed
 * Like writing a summary of what edits were made to a document
 */
export const createChangeDescription = (originalStaff, newStaff) => {
  const changes = [];

  // Check what changed
  if (originalStaff.fullName !== newStaff.fullName) {
    changes.push('name');
  }
  if (originalStaff.role !== newStaff.role) {
    changes.push('role');
  }
  if (originalStaff.comments !== newStaff.comments) {
    changes.push('comments');
  }

  // Check availability changes
  const oldDays = originalStaff.availability || [];
  const newDays = newStaff.availability || [];
  if (oldDays.length !== newDays.length || 
      oldDays.some((day, index) => day !== newDays[index])) {
    changes.push('schedule');
  }

  // Create a friendly message
  if (changes.length === 0) {
    return 'No changes made';
  }

  return `Updated ${newStaff.fullName}'s ${changes.join(' and ')}`;
};

/**
 * Create a change record only if there were actual changes
 * Like saving a document only if edits were made
 */
export const createChangeRecord = (originalStaff, newStaff) => {
  // First, check if anything actually changed
  if (!hasActualChanges(originalStaff, newStaff)) {
    return null;
  }

  // If there were changes, create a record
  return {
    timestamp: new Date().toISOString(),
    staffId: newStaff.staffID,
    description: createChangeDescription(originalStaff, newStaff),
    type: 'EDIT',
    originalState: { ...originalStaff },
    newState: { ...newStaff }
  };
};
