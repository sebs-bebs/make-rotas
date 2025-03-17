// StaffSelector.js
import React, { useState, useEffect, useCallback } from 'react';
import { useStaffDetail } from '../context/StaffDetailContext';

const StaffSelector = ({ isOpen, onClose, onAddStaff, currentStaffIds = [] }) => {
  // Debug code removed for performance optimization
  const { getStaffMember } = useStaffDetail();
  const [availableStaff, setAvailableStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Get staff list from StaffDetailContext with modified filtering logic
  const getStaffList = useCallback(() => {
    // Get all staff members from context
    const allStaff = getStaffMember();
    
    console.log('DEBUG StaffSelector getStaffList - All staff from context:', allStaff);
    console.log('DEBUG StaffSelector getStaffList - currentStaffIds (staff names) passed in:', currentStaffIds);
    
    if (!Array.isArray(allStaff)) return [];
    
    // Filter to only include active staff (inList=true) and map to required format
    const activeStaff = allStaff
      .filter(staff => staff.inList === true)
      .map(staff => ({
        id: staff.staffID,
        name: staff.fullName,
        role: staff.role || ''
      }));
    
    console.log('DEBUG StaffSelector getStaffList - Active staff after mapping:', activeStaff);
    
    // Filter out staff already in the table by comparing NAMES
    // currentStaffIds is now an array of staff NAMES from the table
    const filteredStaff = activeStaff.filter(staff => !currentStaffIds.includes(staff.name));
    console.log('DEBUG StaffSelector getStaffList - Final filtered staff:', filteredStaff);
    
    return filteredStaff;
  }, [getStaffMember, currentStaffIds]);

  useEffect(() => {
    if (isOpen) {
      // Reset state when opening
      setSelectedStaff([]);
      setSearchQuery('');
      
      // Get available staff
      const staffList = getStaffList();
      setAvailableStaff(staffList);
    }
  }, [isOpen, getStaffList, currentStaffIds]);

  const handleToggleStaff = (staffId) => {
    setSelectedStaff(prev => {
      const isSelected = prev.includes(staffId);
      const newSelection = isSelected 
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId];
      
      return newSelection;
    });
  };

  const handleAddSelected = () => {
    // Find full staff objects for selected IDs
    const staffToAdd = availableStaff.filter(staff => 
      selectedStaff.includes(staff.id)
    );
    
    if (staffToAdd.length > 0) {
      onAddStaff(staffToAdd);
    }
  };

  // Filter staff based on search query
  const filteredStaff = searchQuery.trim() === '' 
    ? availableStaff 
    : availableStaff.filter(staff => 
        staff.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Select Staff</h2>
        
        {/* Search Box */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        {/* Staff List */}
        <div className="max-h-60 overflow-y-auto border rounded mb-4">
          {filteredStaff.length === 0 ? (
            <div className="p-3 text-gray-500">No staff available</div>
          ) : (
            filteredStaff.map(staff => (
              <div 
                key={staff.id} 
                className="p-2 hover:bg-gray-50 flex items-center"
              >
                <input
                  type="checkbox"
                  id={`staff-${staff.id}`}
                  checked={selectedStaff.includes(staff.id)}
                  onChange={() => handleToggleStaff(staff.id)}
                  className="mr-2"
                />
                <label htmlFor={`staff-${staff.id}`} className="flex-1 cursor-pointer">
                  {staff.name}
                  {staff.role && <span className="text-gray-500 text-sm ml-2">({staff.role})</span>}
                </label>
              </div>
            ))
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Close
          </button>
          <button 
            onClick={handleAddSelected}
            disabled={selectedStaff.length === 0}
            className={`px-4 py-2 rounded ${
              selectedStaff.length === 0 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Add Selected ({selectedStaff.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffSelector;
