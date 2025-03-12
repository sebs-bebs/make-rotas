// AddStaffButton.js
import React from 'react';
import { useDebug } from './Debug/DebugContext';

const AddStaffButton = ({ onClick, disabled = false }) => {
  const { updateDebugVariables } = useDebug();
  
  const handleClick = () => {
    // Track the button click in debug
    updateDebugVariables({
      AddStaffButton: {
        clicked: {
          value: true,
          lastUpdated: new Date().toLocaleTimeString(),
          type: "boolean"
        },
        lastClickTime: {
          value: new Date().toLocaleTimeString(),
          lastUpdated: new Date().toLocaleTimeString(),
          type: "string"
        },
        disabled: {
          value: disabled,
          lastUpdated: new Date().toLocaleTimeString(),
          type: "boolean"
        }
      }
    });
    
    if (onClick && !disabled) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className="px-3 py-1 border rounded hover:bg-gray-50 focus:outline-none"
    >
      Add Staff
    </button>
  );
};

export default AddStaffButton;
