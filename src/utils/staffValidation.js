import { VALIDATION_RULES } from './staffConstants';

// Validation-specific error types
const VALIDATION_ERRORS = {
  NAME_TOO_SHORT: 'NAME_TOO_SHORT',
  NAME_TOO_LONG: 'NAME_TOO_LONG',
  NAME_REQUIRED: 'NAME_REQUIRED',
  ROLE_REQUIRED: 'ROLE_REQUIRED',
  INVALID_AVAILABILITY: 'INVALID_AVAILABILITY'
};

/**
 * Validate staff member name
 * @param {string} name - Staff member name
 * @returns {Object} Validation result
 */
export const validateStaffName = (name) => {
  if (!name || name.trim().length === 0) {
    return {
      isValid: false,
      error: VALIDATION_ERRORS.NAME_REQUIRED,
      message: 'Name is required'
    };
  }

  if (name.length < VALIDATION_RULES.MIN_NAME_LENGTH) {
    return {
      isValid: false,
      error: VALIDATION_ERRORS.NAME_TOO_SHORT,
      message: `Name must be at least ${VALIDATION_RULES.MIN_NAME_LENGTH} characters`
    };
  }

  if (name.length > VALIDATION_RULES.MAX_NAME_LENGTH) {
    return {
      isValid: false,
      error: VALIDATION_ERRORS.NAME_TOO_LONG,
      message: `Name must be no more than ${VALIDATION_RULES.MAX_NAME_LENGTH} characters`
    };
  }

  return { isValid: true };
};

/**
 * Validate staff member role
 * @param {string} role - Staff role
 * @returns {Object} Validation result
 */
export const validateStaffRole = (role) => {
  if (!role || role.trim().length === 0) {
    return {
      isValid: false,
      error: VALIDATION_ERRORS.ROLE_REQUIRED,
      message: 'Role is required'
    };
  }

  return { isValid: true };
};

/**
 * Validate staff member availability
 * @param {string[]} availability - Array of availability days
 * @returns {Object} Validation result
 */
export const validateAvailability = (availability) => {
  if (!Array.isArray(availability) || 
      availability.length < VALIDATION_RULES.MIN_AVAILABILITY_DAYS) {
    return {
      isValid: false,
      error: VALIDATION_ERRORS.INVALID_AVAILABILITY,
      message: `At least ${VALIDATION_RULES.MIN_AVAILABILITY_DAYS} day must be selected`
    };
  }

  return { isValid: true };
};

/**
 * Validate entire staff member object
 * @param {Object} staffMember - Staff member to validate
 * @returns {Object} Validation result with any errors
 */
export const validateStaffMember = (staffMember) => {
  const nameValidation = validateStaffName(staffMember.fullName);
  if (!nameValidation.isValid) return nameValidation;

  const roleValidation = validateStaffRole(staffMember.role);
  if (!roleValidation.isValid) return roleValidation;

  const availabilityValidation = validateAvailability(staffMember.availability);
  if (!availabilityValidation.isValid) return availabilityValidation;

  return { isValid: true };
};
