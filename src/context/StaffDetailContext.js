import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// Debug import removed for performance optimization
import { loadStaffListData, saveStaffListData } from '../utils/storage';

const StaffDetailContext = createContext();

/**
 * Think of a staff member like a form in a filing system:
 * - NEW = A blank form being filled out
 * - SAVED = A completed form filed away
 * - EDITING = A filed form pulled out for changes
 * 
 * @typedef {'NEW' | 'SAVED' | 'EDITING'} StaffMemberState
 */

/**
 * Represents a staff member in the system
 * @typedef {Object} StaffMember
 * @property {string} staffID - Unique identifier for the staff member (like a form number)
 * @property {string} fullName - Staff member's full name (required)
 * @property {string} role - Their role, e.g., "Bar Tender" (optional)
 * @property {string} comments - Any notes about the staff member (optional)
 * @property {string[]} availability - Which days they can work (optional)
 * @property {boolean} inList - Whether they're in the active staff list
 * @property {StaffMemberState} state - Current state of this staff record
 */

export function StaffDetailProvider({ children }) {
  // List of all staff members
  const [staffMembers, setStaffMembers] = useState([]);
  
  // Track which staff member is being edited (if any)
  const [editingStaffId, setEditingStaffId] = useState(null);

  // Track loading state
  const [isLoading, setIsLoading] = useState(true);

  // Removed debug tracking for performance optimization

  // Load initial data from localStorage
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await loadStaffListData();
        console.log('Loaded data from localStorage:', data); // Debug log
        if (data && data.staffMembers) {
          // Ensure each staff member has required fields
          const validatedStaffMembers = data.staffMembers.map(staff => ({
            ...staff,
            inList: staff.inList !== undefined ? staff.inList : true, // Preserve inList status instead of forcing true
            state: 'SAVED', // Ensure state is set
            availability: staff.availability || [] // Ensure availability exists
          }));
          setStaffMembers(validatedStaffMembers);
          if (data.editingStaffId) {
            setEditingStaffId(data.editingStaffId);
          }
        }
      } catch (error) {
        console.error('Error loading staff data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save to localStorage whenever staff members change
  useEffect(() => {
    const saveData = async () => {
      const dataToSave = {
        staffMembers,
        editingStaffId,
        lastUpdated: new Date().toISOString()
      };
      console.log('Saving data to localStorage:', dataToSave); // Debug log
      try {
        await saveStaffListData(dataToSave);
      } catch (error) {
        console.error('Error saving staff data:', error);
      }
    };

    if (!isLoading) {
      saveData();
    }
  }, [staffMembers, editingStaffId, isLoading]);

  /**
   * Add a new staff member to the list
   * @param {StaffMember} staffMember - The new staff member to add
   */
  const addStaffMember = (staffMember) => {
    // Don't allow adding if someone is being edited
    if (editingStaffId) {
      console.warn('Cannot add new staff while editing another staff member');
      return;
    }

    setStaffMembers(prev => [...prev, {
      ...staffMember,
      state: 'SAVED',  // Start as SAVED after adding
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
        return updated;
      }
      return staff;
    }));
  };

  /**
   * Update a staff member's availability
   * @param {string} staffId - ID of staff member to update
   * @param {string[]} availability - New availability array
   */
  const updateStaffAvailability = (staffId, availability) => {
    setStaffMembers(prev => prev.map(staff => 
      staff.staffID === staffId
        ? { ...staff, availability }
        : staff
    ));
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
   * Get a staff member by ID, or all staff members if no ID provided
   * @param {string} [staffID] - Optional staff ID to retrieve
   * @returns {Object|Object[]|null} Staff member object, array of all staff, or null
   */
  const getStaffMember = useCallback((staffID) => {
    if (!staffID) {
      // If no ID provided, return all staff members
      return staffMembers;
    }
    return staffMembers.find(staff => staff.staffID === staffID) || null;
  }, [staffMembers]);

  /**
   * Get all active staff members (where inList is true)
   * @returns {StaffMember[]}
   */
  const getActiveStaffMembers = () => {
    return staffMembers.filter(staff => staff.inList);
  };

  /**
   * Start editing a staff member
   * @param {string} staffID 
   */
  const startEditing = (staffID) => {
    const staff = getStaffMember(staffID);
    if (staff && staff.state === 'SAVED') {
      setEditingStaffId(staffID);
      updateStaffMember(staffID, { state: 'EDITING' });
    }
  };

  /**
   * Save changes to a staff member being edited
   * @param {string} staffID 
   * @param {Partial<StaffMember>} updates 
   */
  const saveEdits = (staffID, updates) => {
    const staff = getStaffMember(staffID);
    if (staff && staff.state === 'EDITING') {
      updateStaffMember(staffID, { 
        ...updates,
        state: 'SAVED'
      });
      setEditingStaffId(null);
    }
  };

  /**
   * Cancel editing a staff member
   * @param {string} staffID 
   */
  const cancelEditing = (staffID) => {
    const staff = getStaffMember(staffID);
    if (staff && staff.state === 'EDITING') {
      updateStaffMember(staffID, { state: 'SAVED' });
      setEditingStaffId(null);
    }
  };

  // Helper functions for availability stats
  const getMostCommonDay = (staff) => {
    const dayCounts = countDays(staff);
    return Object.entries(dayCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';
  };

  const getLeastCommonDay = (staff) => {
    const dayCounts = countDays(staff);
    return Object.entries(dayCounts)
      .sort(([,a], [,b]) => a - b)[0]?.[0] || 'None';
  };

  const getAverageDaysPerStaff = (staff) => {
    if (!staff.length) return 0;
    const totalDays = staff.reduce((sum, member) => 
      sum + member.availability.length, 0);
    return (totalDays / staff.length).toFixed(1);
  };

  const countDays = (staff) => {
    return staff.reduce((counts, member) => {
      member.availability.forEach(day => {
        counts[day] = (counts[day] || 0) + 1;
      });
      return counts;
    }, {});
  };

  return (
    <StaffDetailContext.Provider value={{
      staffMembers,
      editingStaffId,
      isLoading,
      addStaffMember,
      removeStaffMember,
      updateStaffMember,
      updateStaffAvailability,
      getStaffMember,
      getActiveStaffMembers,
      startEditing,
      saveEdits,
      cancelEditing
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
