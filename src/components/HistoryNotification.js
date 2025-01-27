import React, { useEffect, useState } from 'react';

/**
 * Notification component for showing history changes
 * Appears in bottom-left corner and can be dismissed
 */
const HistoryNotification = ({ message, onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center bg-white rounded-lg shadow-lg p-4 transition-all duration-300">
      <div className="mr-3">{message}</div>
      <button
        onClick={() => {
          setIsVisible(false);
          onClose();
        }}
        className="text-gray-500 hover:text-gray-700"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

export default HistoryNotification;
