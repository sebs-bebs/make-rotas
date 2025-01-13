'use client';
import React from 'react';

/*
  Adjusted the border-radius to rounded-md instead of rounded-full
  for a more standard button shape. Increased padding for more click area.
  Class .bg-purple-600 can be changed to other brand colors as needed.
*/
export default function Button({ children, onClick, className = '', ...props }) {
  return (
    <button
      onClick={onClick}
      className={`bg-purple-600 hover:bg-purple-700 focus:outline-none 
        focus:ring-2 focus:ring-purple-400 rounded-md text-white px-5 py-2 transition 
        ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
