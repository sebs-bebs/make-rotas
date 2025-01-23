// src/app/page.js
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ShiftSlot from '../components/ShiftSlot';
import ShiftRemarks from '../components/ShiftRemarks';
import Button from '../components/Button';
import StaffManagement from '../components/StaffManagement';
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

const generateUniqueKey = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to create a unique staff ID for a specific week
const createWeeklyStaffId = (staffId, weekId) => {
  return `staff-${staffId}-week-${weekId}`;
};

export default function HomePage() {
  // Initialize first week with current date
  const initialWeek = {
    id: generateUniqueKey(),
    startDate: new Date().toISOString().split('T')[0],
    staff: [],
    days: generateWeekDays(new Date().toISOString().split('T')[0]),
  };

  const [weeks, setWeeks] = useState([initialWeek]);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [allStaff, setAllStaff] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [remarks, setRemarks] = useState([]);
  const [activeTab, setActiveTab] = useState('rota');

  useEffect(() => {
    const storedStaffList = localStorage.getItem('staffList');
    if (storedStaffList) {
      const parsedStaffList = JSON.parse(storedStaffList);
      setStaffList(parsedStaffList);
      setAllStaff(parsedStaffList);
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
    localStorage.setItem('allStaff', JSON.stringify(allStaff));
  }, [allStaff]);

  useEffect(() => {
    localStorage.setItem('allRemarks', JSON.stringify(remarks));
  }, [remarks]);

  const handleAddStaff = (newStaffData) => {
    const staffId = generateUniqueKey();
    const newStaff = {
      id: staffId,
      name: newStaffData.firstName + ' ' + newStaffData.lastName,
      role: newStaffData.role,
      email: newStaffData.email,
      phone: newStaffData.phone,
      defaultAvailability: newStaffData.defaultAvailability,
      isActive: newStaffData.isActive,
    };

    setAllStaff((prev) => [...prev, newStaff]);
    setStaffList((prev) => [...prev, newStaff]);
  };

  const handleRemoveStaff = (staffId) => {
    setStaffList((prev) => prev.filter((staff) => staff.id !== staffId));
    setAllStaff((prev) => prev.filter((staff) => staff.id !== staffId));

    setWeeks((prevWeeks) =>
      prevWeeks.map((week) => ({
        ...week,
        staff: week.staff.filter((staff) => staff.originalStaffId !== staffId),
      }))
    );
  };

  const handleAddStaffToWeek = (staffId) => {
    const staffToAdd = allStaff.find((staff) => staff.id === staffId);
    if (!staffToAdd) return;

    setWeeks((prevWeeks) =>
      prevWeeks.map((week, index) => {
        if (index === currentWeekIndex) {
          // Only add if staff is not already in the week
          if (!week.staff.some((s) => s.originalStaffId === staffId)) {
            const weeklyStaffId = createWeeklyStaffId(staffId, week.id);
            const staffWithShifts = {
              ...staffToAdd,
              id: weeklyStaffId,
              originalStaffId: staffId, // Keep track of the original staff ID
              shifts: Array(7).fill('OFF'),
            };
            return {
              ...week,
              staff: [...week.staff, staffWithShifts],
            };
          }
        }
        return week;
      })
    );
  };

  const handleRemoveStaffFromWeek = (weeklyStaffId) => {
    setWeeks((prevWeeks) =>
      prevWeeks.map((week, index) => {
        if (index === currentWeekIndex) {
          return {
            ...week,
            staff: week.staff.filter((staff) => staff.id !== weeklyStaffId),
          };
        }
        return week;
      })
    );
  };

  const handleShiftsChange = useCallback(
    (weekId, staffId, dayIndex, updateFn) => {
      setWeeks((prevWeeks) =>
        prevWeeks.map((week) => {
          if (week.id === weekId) {
            return {
              ...week,
              staff: week.staff.map((staffMember) => {
                if (staffMember.id === staffId) {
                  return {
                    ...staffMember,
                    shifts: updateFn(staffMember.shifts || Array(7).fill('OFF')),
                  };
                }
                return staffMember;
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
    const newWeekId = generateUniqueKey();
    const lastWeek = weeks[weeks.length - 1];
    const newStartDate = new Date(lastWeek.startDate);
    newStartDate.setDate(newStartDate.getDate() + 7);

    const newWeek = {
      id: newWeekId,
      startDate: newStartDate.toISOString().split('T')[0],
      staff: [], // Start with empty staff list
      days: generateWeekDays(newStartDate.toISOString().split('T')[0]),
    };

    setWeeks((prev) => [...prev, newWeek]);
    setCurrentWeekIndex((prev) => prev + 1);
  };

  // Function to handle moving to the previous week
  const handlePreviousWeek = () => {
    setCurrentWeekIndex((prev) => Math.max(0, prev - 1));
  };

  // Function to handle moving to the next week
  const handleNextWeek = () => {
    setCurrentWeekIndex((prev) => Math.min(weeks.length - 1, prev + 1));
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

  // Ensure we always have a valid currentWeek
  const currentWeek = weeks[currentWeekIndex] || initialWeek;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex gap-4">
          <button
            onClick={() => setActiveTab('rota')}
            className={`py-4 px-6 text-sm font-medium ${
              activeTab === 'rota'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Rota
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`py-4 px-6 text-sm font-medium ${
              activeTab === 'staff'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Staff List
          </button>
        </nav>
      </div>

      {/* Rota Tab Content */}
      {activeTab === 'rota' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePreviousWeek}
                className="bg-gray-100 p-2 rounded-full hover:bg-gray-200"
              >
                ←
              </button>
              <button
                onClick={handleNextWeek}
                className="bg-gray-100 p-2 rounded-full hover:bg-gray-200"
              >
                →
              </button>
              <button
                onClick={addWeek}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add Week
              </button>
            </div>
          </div>

          {/* Table section */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
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
                </tr>
              </thead>
              <tbody>
                {currentWeek.staff.map((staff) => {
                  const rowKey = `row-${currentWeek.id}-${staff.id}`;
                  return (
                    <tr key={rowKey}>
                      <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-10 border-r">
                        <div className="flex items-center justify-between">
                          <span>{staff.name}</span>
                          <button
                            onClick={() => handleRemoveStaffFromWeek(staff.id)}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      </td>
                      {currentWeek.days.map((day, dayIndex) => {
                        const cellKey = `cell-${currentWeek.id}-${staff.id}-${dayIndex}`;
                        return (
                          <td
                            key={cellKey}
                            className={`px-6 py-4 whitespace-nowrap border ${
                              dayIndex === 5 || dayIndex === 6 ? 'bg-gray-50' : ''
                            }`}
                          >
                            <ShiftSlot
                              staffId={staff.originalStaffId}
                              dayIndex={dayIndex}
                              shift={staff.shifts[dayIndex] || 'OFF'}
                              onShiftsChange={handleShiftsChange.bind(
                                null,
                                currentWeek.id
                              )}
                              staffShifts={currentWeek.staff.filter(
                                (s) =>
                                  s.originalStaffId === staff.originalStaffId &&
                                  s.id === staff.id
                              )}
                              onAddRemark={handleAddRemark.bind(
                                null,
                                currentWeek.id
                              )}
                              onRemoveRemark={handleRemoveRemark}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Week date range display */}
          <div className="mt-4 text-left">
            <p className="text-lg font-medium">
              Week: {formatDateWithAbbreviatedMonth(new Date(currentWeek.startDate), 'dd/MM/yy')} to{' '}
              {formatDateWithAbbreviatedMonth(new Date(currentWeek.days[6]), 'dd/MM/yy')}
            </p>
          </div>

          {/* Add Staff to Week button */}
          <div className="mt-4 mb-4">
            <button
              onClick={() => {
                const currentWeek = weeks[currentWeekIndex];
                const availableStaff = allStaff.filter(
                  (staff) => !currentWeek.staff.some((s) => s.originalStaffId === staff.id)
                );

                if (availableStaff.length === 0) {
                  alert('No available staff to add');
                  return;
                }

                // Show modal or dropdown with available staff
                const staffSelect = document.createElement('select');
                staffSelect.className = 'border rounded p-2 mr-2';
                availableStaff.forEach((staff) => {
                  const option = document.createElement('option');
                  option.value = staff.id;
                  option.textContent = `${staff.name} (${staff.role || 'No role'})`;
                  staffSelect.appendChild(option);
                });

                const dialog = document.createElement('dialog');
                dialog.className = 'p-4 rounded shadow-lg';

                const form = document.createElement('form');
                form.method = 'dialog';

                const title = document.createElement('h3');
                title.textContent = 'Add Staff to Week';
                title.className = 'text-lg font-bold mb-4';

                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'flex justify-end gap-2 mt-4';

                const addButton = document.createElement('button');
                addButton.textContent = 'Add';
                addButton.className = 'bg-blue-500 text-white px-4 py-2 rounded';
                addButton.onclick = () => {
                  handleAddStaffToWeek(staffSelect.value);
                  dialog.close();
                };

                const cancelButton = document.createElement('button');
                cancelButton.textContent = 'Cancel';
                cancelButton.className = 'bg-gray-300 px-4 py-2 rounded';
                cancelButton.onclick = () => dialog.close();

                buttonContainer.appendChild(cancelButton);
                buttonContainer.appendChild(addButton);

                form.appendChild(title);
                form.appendChild(staffSelect);
                form.appendChild(buttonContainer);
                dialog.appendChild(form);

                document.body.appendChild(dialog);
                dialog.showModal();

                dialog.addEventListener('close', () => {
                  document.body.removeChild(dialog);
                });
              }}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Add Staff to Week
            </button>
          </div>
        </div>
      )}

      {/* Staff List Tab Content */}
      {activeTab === 'staff' && (
        <div className="mt-4">
          <StaffManagement
            staffList={staffList}
            onAddStaff={handleAddStaff}
            onRemoveStaff={handleRemoveStaff}
          />
        </div>
      )}
    </div>
  );
}