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

  const handleAdd = () => {
    if (!input.trim()) return;
    onAddRemark(staffId, dayIndex, input.trim());
    setInput('');
  };

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
              onClick={() => onRemoveRemark(staffId, dayIndex, r.remark)}
              className="text-red-500 ml-2 hover:underline text-xs"
            >
              x
            </button>
          </div>
        ))}
      </div>

      {/* Input to add a new remark */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Add Remarks"
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
    </div>
  );
}
