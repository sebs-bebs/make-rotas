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
        ${disabled ? 'bg-gray-600' : 'border border-gray-900'}
        ${isEditing ? 'bg-blue-500 text-white' : ''}
      `}
    >
      {isEditing ? 'Save' : 'Edit'}
    </button>
  );
}

export default EditButton;
