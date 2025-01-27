import React from 'react';

function Notification({ show, message, description, onClose }) {
  // If show is false, don't display anything
  if (!show) return null;

  return (
    // Changed from left-4 to right-4 to show at bottom right
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 z-50">
      <div className="flex flex-col gap-2">
        <div className="text-gray-800">
          {message || 'Staff Name Needed First'}
        </div>
        <div className="text-gray-600 text-sm">
          {description || 'Please add the staff member\'s full name before continuing.'}
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
