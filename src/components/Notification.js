import React from 'react';

function Notification({ show, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-white shadow-lg rounded-lg p-4 z-50">
      <div className="flex flex-col gap-2">
        <div className="text-gray-800">
          Staff Name Needed First
        </div>
        <div className="text-gray-600 text-sm">
          Please add the staff member's full name before continuing.
        </div>
        <button 
          className="mt-2 bg-gray-100 hover:bg-gray-200 rounded px-2 py-1 text-sm transition-colors"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default Notification;
