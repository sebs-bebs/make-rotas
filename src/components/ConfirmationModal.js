'use client';

import React from 'react';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="mb-6 text-gray-600">{message}</p>
        <div className="flex justify-end gap-0.5">
          <button 
            onClick={onClose}
            className="bg-transparent text-gray-700 hover:text-gray-600 font-regular py-2 px-4 rounded-full text-sm hover:underline"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-full"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
