'use client';
import React, { useState } from 'react';
import StaffManagementModal from './StaffManagementModal';
import StaffImport from './StaffImport';

export default function StaffManagement({ staffList, onAddStaff, onRemoveStaff }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStaff = staffList.filter(staff => 
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImport = (importedStaff) => {
    // Add each imported staff member
    importedStaff.forEach(staff => {
      onAddStaff(staff);
    });
    alert(`Successfully imported ${importedStaff.length} staff members`);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Staff Management</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-full"
          >
            Add Staff Member
          </button>
        </div>
      </div>

      {/* Import Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Import Staff List</h3>
        <StaffImport onImport={handleImport} />
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search staff by name or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border rounded-md p-2"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Default Availability
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStaff.map((staff) => (
              <tr key={staff.id}>
                <td className="px-6 py-4 whitespace-nowrap relative group">
                  <div className="max-w-[200px] truncate">
                    {staff.name}
                  </div>
                  <div className="absolute z-50 invisible group-hover:visible bg-gray-900 text-white text-sm rounded px-2 py-1 -mt-1 
                    whitespace-normal max-w-xs break-words left-6 transform -translate-y-full opacity-0 group-hover:opacity-100 
                    transition-opacity duration-200">
                    {staff.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="max-w-[150px] truncate">
                    {staff.role || '-'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1">
                    {Object.entries(staff.defaultAvailability || {}).map(([day, isAvailable]) => (
                      <span
                        key={day}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                          isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'
                        }`}
                        title={day.charAt(0).toUpperCase() + day.slice(1)}
                      >
                        {day.charAt(0).toUpperCase()}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    {staff.email && (
                      <div className="text-gray-600">{staff.email}</div>
                    )}
                    {staff.phone && (
                      <div className="text-gray-600">{staff.phone}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onRemoveStaff(staff.id)}
                    className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-full"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <StaffManagementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddStaff={onAddStaff}
      />
    </div>
  );
}
