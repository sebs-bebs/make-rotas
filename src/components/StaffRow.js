import React from 'react';

/**
 * A single row in the staff list that can switch between view and edit modes
 */
const StaffRow = ({
  staff,                    // The staff member's data
  isEditing,               // Whether this row is being edited
  otherRowIsEditing,       // Whether another row is being edited
  onEdit,                  // What to do when Edit is clicked
  onSave,                  // What to do when Save is clicked
  onCancel,                // What to do when Cancel is clicked
  onChange                 // What to do when a field changes
}) => {
  // If another row is being edited, show this row as disabled
  if (otherRowIsEditing) {
    return (
      <tr className="border-b border-gray-200">
        <td className="py-4 px-6 text-gray-500">{staff.fullName}</td>
        <td className="py-4 px-6 text-gray-500">{staff.role}</td>
        <td className="py-4 px-6">
          <button 
            className="text-gray-400 cursor-not-allowed"
            disabled
          >
            Edit
          </button>
        </td>
      </tr>
    );
  }

  // If this row is being edited, show input fields
  if (isEditing) {
    return (
      <tr className="border-b border-gray-200 bg-blue-50">
        <td className="py-4 px-6">
          <input
            type="text"
            value={staff.fullName}
            onChange={(e) => onChange('fullName', e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Full Name"
          />
        </td>
        <td className="py-4 px-6">
          <input
            type="text"
            value={staff.role}
            onChange={(e) => onChange('role', e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Role"
          />
        </td>
        <td className="py-4 px-6 space-x-4">
          {/* Save button on the right */}
          <button
            onClick={onSave}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>
          {/* Cancel button on the left */}
          <button
            onClick={onCancel}
            className="text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </td>
      </tr>
    );
  }

  // Normal view mode
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="py-4 px-6">{staff.fullName}</td>
      <td className="py-4 px-6">{staff.role}</td>
      <td className="py-4 px-6">
        <button
          onClick={onEdit}
          className="text-blue-500 hover:text-blue-600"
        >
          Edit
        </button>
      </td>
    </tr>
  );
};

export default StaffRow;
