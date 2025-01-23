// src/app/page.js
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ShiftSlot from '../components/ShiftSlot';
import ShiftRemarks from '../components/ShiftRemarks';
import StaffInput from '../components/StaffInput';
import Button from '../components/Button';
import { formatDateWithAbbreviatedMonth } from '../utils/dateFormatter';
import { saveAsImage } from '../utils/saveAsImage';

const generateWeekDays = (startDate) => {
  const days = [];
  const start = new Date(startDate);

  // Find the first Monday before or on the start date
  const firstMonday = new Date(start);
  firstMonday.setDate(firstMonday.getDate() - ((firstMonday.getDay() + 6) % 7));

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(firstMonday);
    currentDate.setDate(currentDate.getDate() + i);
    days.push(currentDate.toISOString().split('T')[0]);
  }
  return days;
};

export default function HomePage() {
  const [weeks, setWeeks] = useState([
    {
      id: 1,
      startDate: new Date().toISOString().split('T')[0],
      staff: [],
      days: generateWeekDays(new Date().toISOString().split('T')[0]),
    },
  ]);
  const [staffList, setStaffList] = useState([]);
  const [remarks, setRemarks] = useState([]);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);

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

  useEffect(() => {
    localStorage.setItem('staffList', JSON.stringify(staffList));
  }, [staffList]);

  useEffect(() => {
    localStorage.setItem('allRemarks', JSON.stringify(remarks));
  }, [remarks]);

  const handleAddStaff = (newName) => {
    if (!newName || !newName.trim()) {
      alert('Please enter a valid name.');
      return;
    }

    const exists = staffList.some(
      (person) => person.name.toLowerCase() === newName.toLowerCase().trim()
    );
    if (exists) {
      alert('Staff member already exists');
      return;
    }

    const newStaff = {
      id: Date.now().toString(),
      name: newName.trim(),
      shifts: Array(7).fill('OFF'),
    };

    setStaffList((prev) => [...prev, newStaff]);
    setWeeks((prevWeeks) =>
      prevWeeks.map((week) => ({
        ...week,
        staff: [...week.staff, { ...newStaff, shifts: Array(7).fill('OFF') }],
      }))
    );
  };

  const handleRemoveStaff = (staffId) => {
    setStaffList((prev) => prev.filter((staff) => staff.id !== staffId));
    setWeeks((prevWeeks) =>
      prevWeeks.map((week) => ({
        ...week,
        staff: week.staff.filter((staff) => staff.id !== staffId),
      }))
    );
  };

  const handleShiftsChange = useCallback(
    (weekId, staffId, dayIndex, updateFn) => {
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
    },
    []
  );

  const handleAddRemark = (weekId, newRemark) => {
    setRemarks((prev) => [...prev, { ...newRemark, weekId }]);
  };

  const handleRemoveRemark = (remarkId) => {
    setRemarks((prev) => prev.filter((r) => r.id !== remarkId));
  };

  const addWeek = () => {
    const lastWeek = weeks[weeks.length - 1];
    const newStartDate = new Date(lastWeek.days[6]);
    newStartDate.setDate(newStartDate.getDate() + 1); // Start from the next day (Monday)

    const newWeek = {
      id: Date.now().toString(),
      startDate: newStartDate.toISOString().split('T')[0],
      staff: staffList.map((staff) => ({
        ...staff,
        shifts: Array(7).fill('OFF'),
      })),
      days: generateWeekDays(newStartDate),
    };

    setWeeks((prevWeeks) => [...prevWeeks, newWeek]);
  };

  // Function to handle moving to the previous week
  const handlePreviousWeek = () => {
    if (currentWeekIndex > 0) {
      setCurrentWeekIndex(currentWeekIndex - 1);
    }
  };

  // Function to handle moving to the next week
  const handleNextWeek = () => {
    if (currentWeekIndex >= weeks.length - 1) {
      addWeek();
    }
    setCurrentWeekIndex((prevIndex) => prevIndex + 1);
  };

  // Function to handle moving to the current week
  const handleCurrentWeek = () => {
    const today = new Date().toISOString().split('T')[0];
    const currentWeekIndex = weeks.findIndex(
      (week) =>
        new Date(week.startDate) <= new Date(today) &&
        new Date(week.days[6]) >= new Date(today)
    );

    if (currentWeekIndex !== -1) {
      setCurrentWeekIndex(currentWeekIndex);
    } else {
      // Find the nearest week to the current date
      let nearestWeekIndex = 0;
      let minDateDiff = Infinity;
      weeks.forEach((week, index) => {
        const diff = Math.abs(
          new Date(week.startDate).getTime() - new Date(today).getTime()
        );
        if (diff < minDateDiff) {
          minDateDiff = diff;
          nearestWeekIndex = index;
        }
      });
      setCurrentWeekIndex(nearestWeekIndex);
    }
  };

  const removeWeek = (weekId) => {
    setWeeks((prevWeeks) => prevWeeks.filter((week) => week.id !== weekId));
  };

  // Get the current week based on currentWeekIndex
  const currentWeek = weeks[currentWeekIndex];

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <StaffInput onAddStaff={handleAddStaff} />
      </div>

      <div className="mb-4">
        <Button
          onClick={handlePreviousWeek}
          className="bg-blue-500 text-white ml-5"
          disabled={currentWeekIndex === 0}
        >
          Previous Week
        </Button>
        <Button
          onClick={handleNextWeek}
          className="bg-blue-500 text-white ml-5"
        >
          Next Week
        </Button>
        <Button
          onClick={handleCurrentWeek}
          className="bg-green-500 text-white ml-5"
        >
          Current Week
        </Button>
        {/* New button for saving the rota as an image */}
        <Button
          onClick={() =>
            saveAsImage('rota-table', `rota-week-${currentWeekIndex}.png`)
          }
          className="bg-yellow-500 text-white ml-5"
        >
          Save as Image
        </Button>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[25rem]">
        {currentWeek && (
          <div
            key={currentWeek.id}
            id="rota-table"
            className="bg-white p-6 shadow rounded-md mb-4"
          >
            <table className="table-auto w-full border-separate border-spacing-0 md:border-spacing-2">
              <thead className="sticky top-0 z-30 bg-white">
                <tr className="bg-gray-100">
                  <th className="px-6 py-3 border sticky left-0 bg-gray-100 z-10">
                    STAFF
                  </th>
                  {currentWeek.days.map((day, dayIndex) => (
                    <th key={dayIndex} className="px-6 py-3 border">
                      {new Date(day).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        weekday: 'short',
                      })}
                    </th>
                  ))}
                  {/* Removed Weekly Hours header */}
                </tr>
              </thead>
              <tbody>
                {currentWeek.staff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 border sticky left-0 bg-white z-20">
                      <div className="flex items-center justify-between">
                        <span>{staff.name}</span>
                        <Button
                          onClick={() => handleRemoveStaff(staff.id)}
                          className="text-red-500 hover:underline text-xs"
                        >
                          Remove
                        </Button>
                      </div>
                    </td>
                    {staff.shifts.map((shift, dayIndex) => (
                      <td key={dayIndex} className="px-6 py-3 border">
                        <ShiftSlot
                          staffId={staff.id}
                          dayIndex={dayIndex}
                          shift={shift}
                          onShiftsChange={handleShiftsChange.bind(
                            null,
                            currentWeek.id
                          )}
                          staffShifts={staff.shifts}
                          weekId={currentWeek.id}
                        />
                        <ShiftRemarks
                          staffId={staff.id}
                          dayIndex={dayIndex}
                          remarks={remarks.filter(
                            (r) =>
                              r.staffId === staff.id &&
                              r.dayIndex === dayIndex &&
                              r.weekId === currentWeek.id
                          )}
                          onAddRemark={handleAddRemark.bind(
                            null,
                            currentWeek.id
                          )}
                          onRemoveRemark={handleRemoveRemark}
                        />
                      </td>
                    ))}
                    {/* Removed Weekly Hours cell */}
                  </tr>
                ))}
              </tbody>
            </table>
            {/* New div for displaying the current week's date range */}
            <div className="mt-4 text-left">
              <p className="text-lg font-medium">
                Week: {formatDateWithAbbreviatedMonth(new Date(currentWeek.startDate), 'dd/MM/yy')} to{' '}
                {formatDateWithAbbreviatedMonth(new Date(currentWeek.days[6]), 'dd/MM/yy')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}