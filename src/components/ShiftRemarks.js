// src/components/ShiftRemarks.js
'use client';
import React, { useState } from 'react';

export default function ShiftRemarks({
  staffId,
  dayIndex,
  remarks,
  onAddRemark,
  onRemoveRemark,
}) {
  const [input, setInput] = useState('');
  const [isInputVisible, setIsInputVisible] = useState(true); // Track if input is visible

  const handleAdd = () => {
    if (!input.trim()) return;
    onAddRemark(staffId, dayIndex, input.trim());
    setInput('');
    setIsInputVisible(false); // Hide input after adding remark
  };

  const handleRemove = (staffId, dayIndex, remarkText) => {
      onRemoveRemark(staffId, dayIndex, remarkText);
      setIsInputVisible(true)
  }


  return (
      <div className="mt-2">
        {/* Display existing remarks */}
        <div className="flex flex-wrap gap-2 mb-2">
          {remarks.map((r, idx) => (
            <div
              key={idx}
              className="bg-gray-200 px-2 py-1 rounded text-sm flex items-center"
            >
              <span>{r.remark}</span>
              <button
                onClick={() => handleRemove(staffId, dayIndex, r.remark)}
                className="text-red-500 ml-2 hover:underline text-xs"
              >
                x
              </button>
            </div>
          ))}
        </div>

        {/* Input to add a new remark */}
        {isInputVisible && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Comments e.g. Off" // Updated placeholder text
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="border p-2 rounded text-sm w-full"
            />
            <button
              onClick={handleAdd}
              className="bg-indigo-500 text-white px-3 py-1 rounded text-sm hover:bg-indigo-600 transition"
            >
              +
            </button>
          </div>
        )}
      </div>
    );
}