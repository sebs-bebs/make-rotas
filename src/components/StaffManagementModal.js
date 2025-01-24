'use client';
import React, { useState } from 'react';

export default function StaffManagementModal({ isOpen, onClose, onAddStaff }) {
  const [staffData, setStaffData] = useState({
    firstName: '',
    lastName: '',
    role: '',
    email: '',
    phone: '',
    defaultAvailability: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
    isActive: true,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStaffData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvailabilityChange = (day) => {
    setStaffData((prev) => ({
      ...prev,
      defaultAvailability: {
        ...prev.defaultAvailability,
        [day]: !prev.defaultAvailability[day],
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!staffData.firstName.trim() || !staffData.lastName.trim()) {
      alert('Please enter both first and last name.');
      return;
    }

    const newStaff = {
      ...staffData,
      id: Date.now().toString(),
      name: `${staffData.firstName} ${staffData.lastName}${staffData.role ? ` (${staffData.role})` : ''}`,
    };

    onAddStaff(newStaff);
    onClose();
    setStaffData({
      firstName: '',
      lastName: '',
      role: '',
      email: '',
      phone: '',
      defaultAvailability: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      },
      isActive: true,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Add New Staff Member</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name *</label>
              <input
                type="text"
                name="firstName"
                value={staffData.firstName}
                onChange={handleInputChange}
                className="w-full border rounded-md p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={staffData.lastName}
                onChange={handleInputChange}
                className="w-full border rounded-md p-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <input
              type="text"
              name="role"
              value={staffData.role}
              onChange={handleInputChange}
              className="w-full border rounded-md p-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={staffData.email}
                onChange={handleInputChange}
                className="w-full border rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={staffData.phone}
                onChange={handleInputChange}
                className="w-full border rounded-md p-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Default Availability</label>
            <div className="grid grid-cols-7 gap-2">
              {Object.entries(staffData.defaultAvailability).map(([day, isAvailable]) => (
                <div key={day} className="text-center">
                  <label className="block text-xs mb-1 capitalize">{day.slice(0, 3)}</label>
                  <button
                    type="button"
                    onClick={() => handleAvailabilityChange(day)}
                    className={`w-8 h-8 rounded-full ${
                      isAvailable ? 'bg-green-500 text-white' : 'bg-gray-200'
                    }`}
                  >
                    {isAvailable ? '✓' : ''}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button 
              onClick={onClose} 
              className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-full"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-full"
            >
              Add Staff Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
