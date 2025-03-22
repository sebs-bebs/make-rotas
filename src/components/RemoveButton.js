import React from 'react';

function RemoveButton({ onRemove, disabled }) {
  return (
    <button
      onClick={onRemove}
      disabled={disabled}
      className={`
        px-4 py-1 rounded transition-all duration-200
        text-white bg-red-500 hover:bg-red-600
        ${disabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : ''}
        border border-red-500 hover:border-red-600
      `}
    >
      Remove
    </button>
  );
}

export default RemoveButton;