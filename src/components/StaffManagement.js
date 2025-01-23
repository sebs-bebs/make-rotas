'use client';
import React, { useState } from 'react';
import Button from './Button';
import StaffManagementModal from './StaffManagementModal';

export default function StaffManagement({ staffList, onAddStaff, onRemoveStaff }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStaff = staffList.filter(staff => 
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Staff Management</h2>
        <Button onClick={() => setIsModalOpen(true)} className="bg-blue-500">
          Add New Staff
        </Button>
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
                <td className="px-6 py-4 whitespace-nowrap">
                  {staff.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {staff.role || '-'}
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
                  <Button
                    onClick={() => onRemoveStaff(staff.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Remove
                  </Button>
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
