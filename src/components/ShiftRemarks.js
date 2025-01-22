// src/components/ShiftRemarks.js
'use client';
import React, { useState, useEffect } from 'react';
import { generateUniqueKey } from '@/lib/generateUniqueKey'; // Import the unique key generator

export default function ShiftRemarks({
  staffId,
  dayIndex,
  remarks,
  onAddRemark,
  onRemoveRemark,
}) {
  const [input, setInput] = useState('');

  const hasRemarks = remarks && remarks.length > 0;

  // Function to handle adding a remark
  const handleAdd = () => {
    if (!input.trim()) {
      alert('Please enter a valid comment.');
      return;
    }
    const newRemark = {
      id: generateUniqueKey(), // Assign a unique ID to each remark
      staffId,
      dayIndex,
      remark: input.trim(),
    };
    onAddRemark(newRemark); // Pass the new remark object
    setInput('');
  };

  // Function to handle removing a remark
  const handleRemove = (remarkId) => {
    onRemoveRemark(remarkId); // Pass the unique ID to remove the specific remark
  };

  return (
    <div className="mt-2">
      {/* Display existing remarks */}
      {hasRemarks && (
        <div className="flex flex-wrap gap-2 mb-2">
          {remarks.map((r) => (
            <div
              key={r.id} // Use the unique ID as the key
              className="bg-gray-200 px-2 py-1 rounded text-sm flex items-center"
            >
              {/* Truncated Comment Text */}
              <span className="truncate max-w-[150px]" title={r.remark}>
                {r.remark}
              </span>
              {/* Remove Button */}
              <button
                onClick={() => handleRemove(r.id)} // Pass the unique ID to the handler
                className="text-red-500 ml-2 hover:underline text-xs"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input to add a new remark */}
      {!hasRemarks && (
        <div className="shift-remarks-container">
          <input
            type="text"
            placeholder="Comments e.g. Off"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="shift-remarks-input border p-2 rounded text-sm"
          />
          <button
            onClick={handleAdd}
            className="shift-remarks-button bg-indigo-500 text-white px-3 py-1 rounded text-sm hover:bg-indigo-600 transition"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}