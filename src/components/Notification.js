import React from 'react';

function Notification({ show, onClose }) {
  // Constants for tracking
  const NOTIFICATION_WIDTH = 20; // in rem
  const NOTIFICATION_Z_INDEX = 50;

  if (!show) return null;

  return (
    // Floating container
    <div className={`fixed top-4 right-4 w-[${NOTIFICATION_WIDTH}rem] bg-white shadow-lg rounded-lg p-4 z-${NOTIFICATION_Z_INDEX}`}>
      {/* Column container */}
      <div className="flex flex-col gap-4">
        {/* Row 1 */}
        <div className="flex justify-end w-full bg-gray-50 p-3 rounded">
          <button 
            className="w-1/4 hover:bg-gray-200 rounded px-2 py-1 transition-colors"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {/* Row 2 */}
        <div className="bg-gray-50 p-3 rounded font-semibold text-gray-800">
          Staff Name Needed First
        </div>

        {/* Row 3 */}
        <div className="bg-gray-50 p-3 rounded text-gray-600">
          Please add the staff member's full name before continuing.
        </div>
      </div>
    </div>
  );
}

export default Notification;
