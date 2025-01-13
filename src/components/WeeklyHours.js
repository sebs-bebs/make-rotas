'use client';
import React from 'react';

export default function WeeklyHours({ totalHours }) {
  return (
    <div className="font-bold text-xl text-right">
      Weekly Hours: {totalHours.toFixed(2)}
    </div>
  );
}
