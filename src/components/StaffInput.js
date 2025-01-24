// src/components/StaffInput.js
'use client';
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function StaffInput({ onAddStaff }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleAdd = () => {
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!fullName) return alert('Please enter a valid name.');
    onAddStaff(fullName); // Pass only the name as a string
    setFirstName('');
    setLastName('');
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div>
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="border p-2 rounded-md"
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="border p-2 rounded-md"
        />
      </div>
      <button 
        onClick={handleAdd}
        className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-full"
      >
        Add Staff
      </button>
    </div>
  );
}