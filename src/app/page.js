// src/app/page.js
'use client'; // Declare as a Client Component

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter from next/navigation
import ShiftSlot from '../components/ShiftSlot';
import ShiftRemarks from '../components/ShiftRemarks';
import StaffInput from '../components/StaffInput';
import Button from '../components/Button';
import DateRangePicker from '../components/DateRangePicker'; // Import the DateRangePicker
import { generateUniqueKey } from '../lib/generateUniqueKey'; // Import the unique key generator
import { calculateWeeklyHours } from '../utils/calculateWeeklyHours';

const generateWeekDays = (startDate) => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);
    days.push(currentDate.toISOString().split('T')[0]); // Use ISO string format
  }
  return days;
};

export default function HomePage() {
  // State to manage the list of weeks
  const [weeks, setWeeks] = useState([
    {
      id: generateUniqueKey(),
      startDate: new Date().toISOString().split('T')[0], // Changed to current date
      staff: [],
      days: generateWeekDays(new Date().toISOString().split('T')[0]), // Update days generation as well
    },
  ]);

  // State to manage the list of staff members (shared across weeks)
  const [staffList, setStaffList] = useState([]);

  // State to manage remarks (associated with specific weeks, staff, and days)
  const [remarks, setRemarks] = useState([]);

  // Access the router for navigation
  const router = useRouter();

  // State for date range
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  // Load staff list and remarks from localStorage on mount
  useEffect(() => {
    const storedStaffList = localStorage.getItem('staffList');
    if (storedStaffList) {
      setStaffList(JSON.parse(storedStaffList));
    }
    const storedRemarks = localStorage.getItem('allRemarks');
    if (storedRemarks) {
      setRemarks(JSON.parse(storedRemarks));
    }
  }, []);

  // Save staff list and remarks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('staffList', JSON.stringify(staffList));
  }, [staffList]);

  useEffect(() => {
    localStorage.setItem('allRemarks', JSON.stringify(remarks));
  }, [remarks]);

  // Function to add a new staff member to the staffList
  const handleAddStaff = (newName) => {
    if (!newName || !newName.trim()) {
      alert('Please enter a valid name.');
      return;
    }

    // Check if the staff member already exists (case-insensitive)
    const exists = staffList.some(
      (person) => person.name.toLowerCase() === newName.toLowerCase().trim()
    );
    if (exists) {
      alert('Staff member already exists');
      return;
    }

    // Create a new staff object with default "OFF" shifts for each week
    const newStaff = {
      id: generateUniqueKey(),
      name: newName.trim(),
      shifts: Array(7).fill('OFF'), // Assuming 7 days in a week
    };

    setStaffList((prev) => [...prev, newStaff]);

    // Add the new staff member to each week with default "OFF" shifts
    setWeeks((prevWeeks) =>
      prevWeeks.map((week) => ({
        ...week,
        staff: [...week.staff, { ...newStaff, shifts: Array(7).fill('OFF') }],
      }))
    );
  };

  // Function to remove a staff member from the staffList and all weeks
  const handleRemoveStaff = (staffId) => {
    setStaffList((prev) => prev.filter((staff) => staff.id !== staffId));
    setWeeks((prevWeeks) =>
      prevWeeks.map((week) => ({
        ...week,
        staff: week.staff.filter((staff) => staff.id !== staffId),
      }))
    );
  };

  // Function to handle shifts change for a specific week, staff member, and day
  const handleShiftsChange = useCallback((weekId, staffId, dayIndex, updateFn) => {
    setWeeks((prevWeeks) =>
      prevWeeks.map((week) => {
        if (week.id === weekId) {
          return {
            ...week,
            staff: week.staff.map((staff) => {
              if (staff.id === staffId) {
                const updatedShifts = updateFn(staff.shifts);
                return { ...staff, shifts: updatedShifts };
              }
              return staff;
            }),
          };
        }
        return week;
      })
    );
  }, []);

  // Function to add a new remark for a specific week, staff member, and day
  const handleAddRemark = (weekId, newRemark) => {
    setRemarks((prev) => [...prev, { ...newRemark, weekId }]);
  };

  // Function to remove a remark based on its ID
  const handleRemoveRemark = (remarkId) => {
    setRemarks((prev) =>
      prev.filter((r) => r.id !== remarkId)
    );
  };

  // Function to calculate the total weekly hours for a set of shifts
  const getWeeklyHours = (shifts) => calculateWeeklyHours(shifts);

  // Function to add a new week
  const addWeek = () => {
    if (weeks.length === 0) {
      // If no weeks exist, start from a default date
      const defaultStartDate = new Date(); // Changed to current date
      setWeeks((prevWeeks) => [
        ...prevWeeks,
        {
          id: generateUniqueKey(),
          startDate: defaultStartDate.toISOString().split('T')[0], // Use ISO string format
          staff: staffList.map((staff) => ({
            ...staff,
            shifts: Array(7).fill('OFF'),
          })),
          days: generateWeekDays(defaultStartDate),
        },
      ]);
    } else {
      // If weeks exist, add a new week starting 7 days after the last week's start date
      const lastWeek = weeks[weeks.length - 1];
      const newStartDate = new Date(lastWeek.startDate);
      newStartDate.setDate(newStartDate.getDate() + 7); // Add 7 days

      setWeeks((prevWeeks) => [
        ...prevWeeks,
        {
          id: generateUniqueKey(),
          startDate: newStartDate.toISOString().split('T')[0], // Use ISO string format
          staff: staffList.map((staff) => ({
            ...staff,
            shifts: Array(7).fill('OFF'),
          })),
          days: generateWeekDays(newStartDate),
        },
      ]);
    }
  };

  // Function to navigate to a specific week
  const handleWeekNavigation = (weekId) => {
    router.push(`/week/${weekId}`);
  };

  // Function to remove a week
  const removeWeek = (weekId) => {
    setWeeks((prevWeeks) => prevWeeks.filter((week) => week.id !== weekId));
    if (router.query?.weekId === weekId) {
      router.push('/');
    }
  };

  // Function to handle date range change
  const handleDateRangeChange = (range) => {
    setDateRange(range);
    if (range.startDate && range.endDate) {
      const newWeeks = [];
      let currentDate = new Date(range.startDate);
      while (currentDate <= range.endDate) {
        const weekStart = new Date(currentDate);
        const weekEnd = new Date(currentDate);
        weekEnd.setDate(weekEnd.getDate() + 6);
        newWeeks.push({
          id: generateUniqueKey(),
          startDate: weekStart,
          staff: staffList.map((staff) => ({
            ...staff,
            shifts: Array(7).fill('OFF'),
          })),
          days: generateWeekDays(weekStart),
        });
        currentDate.setDate(currentDate.getDate() + 7);
      }
      setWeeks(newWeeks);
    }
  };

  // Determine the current week ID
  const currentWeekId = router.query?.weekId || weeks[0]?.id;

  return (
    <div>
      {/* Date Range Picker */}
      <DateRangePicker onDateRangeChange={handleDateRangeChange} />

      {/* Staff Input Section */}
      <div className="flex gap-4 mb-6">
        <StaffInput onAddStaff={handleAddStaff} />
      </div>

      {/* Weeks Navigation */}
      <div className="flex gap-2 mb-4">
        {weeks.map((week) => (
          <Button
            key={week.id}
            onClick={() => handleWeekNavigation(week.id)}
            className={`${currentWeekId === week.id ? 'bg-purple-600 text-white' : 'bg-gray-300'}`}
          >
            Week of {new Date(week.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Button>
        ))}
        <Button onClick={addWeek} className="bg-purple-700 text-white">
          Add Week
        </Button>
      </div>

      {/* Table Wrapper */}
      <div className="overflow-x-auto overflow-y-auto max-h-[25rem]">
        {weeks.map((week) => (
          <div
            key={week.id}
            id="rota-table"
            className={`bg-white p-6 shadow rounded-md mb-4 ${currentWeekId === week.id ? 'block' : 'hidden'}`}
          >
            <table className="table-auto w-full border-separate border-spacing-0 md:border-spacing-2">
              {/* Table Header */}
              <thead className="sticky top-0 z-30 bg-white">
                <tr className="bg-gray-100">
                  <th className="px-6 py-3 border sticky left-0 bg-gray-100 z-10">
                    STAFF
                  </th>
                  {week.days.map((day, dayIndex) => (
                    <th key={dayIndex} className="px-6 py-3 border">
                      {new Date(day).toLocaleDateString('en-US', {
                        month: 'short', // Use short month names
                        day: 'numeric',
                        weekday: 'short',
                      })}
                    </th>
                  ))}
                  {/* Removed "Total Hours" and "Actions" columns */}
                </tr>
              </thead>
              <tbody>
                {week.staff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50">
                    {/* First Column Styling */}
                    <td className="px-6 py-3 border sticky left-0 bg-white z-20">
                      <div className="flex items-center justify-between">
                        <span>{staff.name}</span>
                        {/* Removed "x" button */}
                      </div>
                    </td>
                    {/* Remaining table cells */}
                    {staff.shifts.map((shift, dayIndex) => (
                      <td key={dayIndex} className="px-6 py-3 border">
                        <ShiftSlot
                          staffId={staff.id}
                          dayIndex={dayIndex}
                          shift={shift}
                          onShiftsChange={handleShiftsChange.bind(null, week.id)}
                          staffShifts={staff.shifts}
                          weekId={week.id}
                        />
                        <ShiftRemarks
                          staffId={staff.id}
                          dayIndex={dayIndex}
                          remarks={remarks.filter(
                            (r) =>
                              r.staffId === staff.id &&
                              r.dayIndex === dayIndex &&
                              r.weekId === week.id
                          )}
                          onAddRemark={handleAddRemark.bind(null, week.id)}
                          onRemoveRemark={handleRemoveRemark}
                        />
                      </td>
                    ))}
                    {/* Removed "Total Hours" and "Actions" columns */}
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Removed "Grand Total" */}
          </div>
        ))}
      </div>
      {/* Removed "Save as Image" Button */}
    </div>
  );
}