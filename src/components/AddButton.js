import React from 'react';

function AddButton({ onAdd, disabled }) {
  return (
    <button 
      onClick={onAdd}
      disabled={disabled}
      className={`
        ${disabled ? 'bg-gray-600' : 'border border-gray-900'}
      `}
    >
      Add
    </button>
  );
}

export default AddButton;
