import React, { createContext, useContext, useState } from 'react';

const StaffDetailContext = createContext();

/**
 * @typedef {Object} StaffMember
 * @property {string} staffID - Unique identifier for the staff member
 * @property {string} firstName - First name of the staff member
 * @property {string} lastName - Last name of the staff member
 * @property {string} fullName - Computed full name (firstName + lastName)
 * @property {string} role - Role of the staff member
 * @property {string} comments - Additional comments
 * @property {string[]} availability - Array of day names indicating availability
 * @property {boolean} inList - Whether the staff member is currently in the list
 */

export function StaffDetailProvider({ children }) {
  const [staffMembers, setStaffMembers] = useState([]);

  /**
   * Add a new staff member to the list
   * @param {StaffMember} staffMember 
   */
  const addStaffMember = (staffMember) => {
    setStaffMembers(prev => [...prev, {
      ...staffMember,
      fullName: `${staffMember.firstName} ${staffMember.lastName}`.trim(),
      inList: true
    }]);
  };

  /**
   * Update an existing staff member
   * @param {string} staffID 
   * @param {Partial<StaffMember>} updates 
   */
  const updateStaffMember = (staffID, updates) => {
    setStaffMembers(prev => prev.map(staff => {
      if (staff.staffID === staffID) {
        const updated = { ...staff, ...updates };
        // Ensure fullName is always synchronized
        if (updates.firstName || updates.lastName) {
          updated.fullName = `${updated.firstName} ${updated.lastName}`.trim();
        }
        return updated;
      }
      return staff;
    }));
  };

  /**
   * Remove a staff member from the list (sets inList to false)
   * @param {string} staffID 
   */
  const removeStaffMember = (staffID) => {
    setStaffMembers(prev => prev.map(staff => 
      staff.staffID === staffID ? { ...staff, inList: false } : staff
    ));
  };

  /**
   * Get a staff member by their ID
   * @param {string} staffID 
   * @returns {StaffMember | undefined}
   */
  const getStaffMember = (staffID) => {
    return staffMembers.find(staff => staff.staffID === staffID);
  };

  /**
   * Get all active staff members (where inList is true)
   * @returns {StaffMember[]}
   */
  const getActiveStaffMembers = () => {
    return staffMembers.filter(staff => staff.inList);
  };

  return (
    <StaffDetailContext.Provider value={{ 
      staffMembers,
      addStaffMember,
      updateStaffMember,
      removeStaffMember,
      getStaffMember,
      getActiveStaffMembers
    }}>
      {children}
    </StaffDetailContext.Provider>
  );
}

export const useStaffDetail = () => {
  const context = useContext(StaffDetailContext);
  if (!context) {
    throw new Error('useStaffDetail must be used within StaffDetailProvider');
  }
  return context;
};
