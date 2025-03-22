import React from 'react';

/**
 * EditButton component for toggling edit mode of a staff member
 * @param {Object} props
 * @param {Function} props.onEdit - Callback when edit button is clicked
 * @param {boolean} props.isEditing - Whether this staff member is currently being edited
 * @param {boolean} props.disabled - Whether the button should be disabled
 */
function EditButton({ onEdit, isEditing, disabled }) {
  return (
    <button
      onClick={onEdit}
      disabled={disabled}
      className={`
        px-4 py-1 rounded transition-all duration-200
        ${disabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : ''}
        ${isEditing ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}
        border ${isEditing ? 'border-blue-500' : 'border-gray-400'}
      `}
    >
      {isEditing ? 'Save' : 'Edit'}
    </button>
  );
}

export default EditButton;
