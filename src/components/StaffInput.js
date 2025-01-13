'use client';
import React, { useState } from 'react';
import Button from './Button';

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
      <Button onClick={handleAdd}>
        Add Staff Member
      </Button>
    </div>
  );
}
