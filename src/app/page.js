// src/app/page.js
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ShiftSlot from '../components/ShiftSlot';
import ShiftRemarks from '../components/ShiftRemarks';
import Button from '../components/Button';
import StaffManagement from '../components/StaffManagement';
import ConfirmationModal from '../components/ConfirmationModal';
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
  const [comments, setComments] = useState({});  // Format: { 'weekId-staffId-dayIndex': { text: 'comment', timestamp: 'date' } }
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(new Set());
  const [selectedStaffToRemove, setSelectedStaffToRemove] = useState(new Set());
  const [showRemoveAllConfirm, setShowRemoveAllConfirm] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [staffToRemove, setStaffToRemove] = useState(null);
  const [staffSearchTerm, setStaffSearchTerm] = useState('');

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
    const savedComments = localStorage.getItem('rota-comments');
    if (savedComments) {
      setComments(JSON.parse(savedComments));
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

  useEffect(() => {
    localStorage.setItem('rota-comments', JSON.stringify(comments));
  }, [comments]);

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
    const staff = staffList.find(staff => staff.id === staffId);
    setStaffToRemove(staff);
    setShowRemoveConfirm(true);
  };

  const confirmRemoveStaff = () => {
    if (!staffToRemove) return;
    
    setStaffList((prev) => prev.filter((staff) => staff.id !== staffToRemove.id));
    setAllStaff((prev) => prev.filter((staff) => staff.id !== staffToRemove.id));

    setWeeks((prevWeeks) =>
      prevWeeks.map((week) => ({
        ...week,
        staff: week.staff.filter((staff) => staff.originalStaffId !== staffToRemove.id),
      }))
    );

    setStaffToRemove(null);
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
              shifts: Array(7).fill(''),
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

  const handleAddComment = useCallback((weekId, staffId, dayIndex, comment) => {
    setComments(prevComments => {
      const key = `${weekId}-${staffId}-${dayIndex}`;
      return {
        ...prevComments,
        [key]: {
          id: generateUniqueKey(),
          text: comment,
          timestamp: new Date().toISOString(),
        }
      };
    });
  }, []);

  const handleDeleteComment = useCallback((weekId, staffId, dayIndex) => {
    setComments(prevComments => {
      const key = `${weekId}-${staffId}-${dayIndex}`;
      const newComments = { ...prevComments };
      delete newComments[key];
      return newComments;
    });
  }, []);

  const addWeek = (direction = 'next') => {
    const newWeekId = generateUniqueKey();
    const lastWeek = weeks[direction === 'next' ? weeks.length - 1 : 0];
    const newStartDate = new Date(lastWeek.startDate);
    
    // Add or subtract 7 days based on direction
    newStartDate.setDate(newStartDate.getDate() + (direction === 'next' ? 7 : -7));
    
    const newWeek = {
      id: newWeekId,
      startDate: newStartDate.toISOString(),
      staff: [],
      days: Array.from({ length: 7 }, (_, i) => {
        const day = new Date(newStartDate);
        day.setDate(day.getDate() + i);
        return day.toISOString();
      }),
    };

    setWeeks(prevWeeks => {
      if (direction === 'next') {
        return [...prevWeeks, newWeek];
      } else {
        return [newWeek, ...prevWeeks];
      }
    });

    // If adding a previous week, we need to adjust currentWeekIndex
    if (direction === 'previous') {
      setCurrentWeekIndex(prev => prev + 1);
    }
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

  const getCurrentWeekIndex = useCallback(() => {
    const today = new Date();
    return weeks.findIndex(week => {
      const weekStart = new Date(week.startDate);
      const weekEnd = new Date(week.days[6]);
      return today >= weekStart && today <= weekEnd;
    });
  }, [weeks]);

  const handleGoToCurrentWeek = () => {
    const currentWeekIdx = getCurrentWeekIndex();
    if (currentWeekIdx !== -1) {
      setCurrentWeekIndex(currentWeekIdx);
    } else {
      // If current week doesn't exist, create it
      const lastWeek = weeks[weeks.length - 1];
      const lastWeekEnd = new Date(lastWeek.days[6]);
      const today = new Date();
      
      // If today is after the last week, add weeks until we reach current week
      if (today > lastWeekEnd) {
        let tempDate = new Date(lastWeek.startDate);
        while (tempDate <= today) {
          tempDate.setDate(tempDate.getDate() + 7);
          addWeek('next');
        }
        setCurrentWeekIndex(weeks.length); // Set to the newly added week
      } else {
        // If today is before the first week, add weeks until we reach current week
        const firstWeek = weeks[0];
        const firstWeekStart = new Date(firstWeek.startDate);
        if (today < firstWeekStart) {
          let tempDate = new Date(firstWeek.startDate);
          let weeksToAdd = 0;
          while (tempDate > today) {
            tempDate.setDate(tempDate.getDate() - 7);
            weeksToAdd++;
          }
          for (let i = 0; i < weeksToAdd; i++) {
            addWeek('previous');
          }
          setCurrentWeekIndex(weeksToAdd);
        }
      }
    }
  };

  const handleBulkAddStaff = () => {
    const currentWeek = weeks[currentWeekIndex];
    const staffToAdd = Array.from(selectedStaff).map(staffId => {
      const staffMember = staffList.find(s => s.id === staffId);
      return {
        id: generateUniqueKey(),
        originalStaffId: staffId,
        name: staffMember.name,
        role: staffMember.role,
        shifts: Array(7).fill('')
      };
    });

    setWeeks(prevWeeks => {
      return prevWeeks.map(week => {
        if (week.id === currentWeek.id) {
          return {
            ...week,
            staff: [...week.staff, ...staffToAdd]
          };
        }
        return week;
      });
    });

    setSelectedStaff(new Set());
    setShowBulkAddModal(false);
  };

  const handleRemoveSelectedStaff = () => {
    setWeeks(prevWeeks => {
      return prevWeeks.map(week => {
        if (week.id === currentWeek.id) {
          return {
            ...week,
            staff: week.staff.filter(staff => !selectedStaffToRemove.has(staff.id))
          };
        }
        return week;
      });
    });
    setSelectedStaffToRemove(new Set());
  };

  const toggleStaffSelection = (staffId) => {
    setSelectedStaffToRemove(prev => {
      const newSet = new Set(prev);
      if (newSet.has(staffId)) {
        newSet.delete(staffId);
      } else {
        newSet.add(staffId);
      }
      return newSet;
    });
  };

  const getAvailableStaff = () => {
    const currentWeek = weeks[currentWeekIndex];
    const availableStaff = staffList.filter(
      staff => !currentWeek.staff.some(s => s.originalStaffId === staff.id)
    );
    
    if (!staffSearchTerm) return availableStaff;
    
    return availableStaff.filter(staff => 
      staff.name.toLowerCase().includes(staffSearchTerm.toLowerCase()) ||
      (staff.role && staff.role.toLowerCase().includes(staffSearchTerm.toLowerCase()))
    );
  };

  const handleRemoveAllStaff = () => {
    setWeeks(prevWeeks => {
      return prevWeeks.map(week => {
        if (week.id === currentWeek.id) {
          return {
            ...week,
            staff: []
          };
        }
        return week;
      });
    });
    setShowRemoveAllConfirm(false);
  };

  const handleSelectAllStaff = () => {
    const availableStaff = getAvailableStaff();
    setSelectedStaff(new Set(availableStaff.map(staff => staff.id)));
  };

  const handleDeselectAllStaff = () => {
    setSelectedStaff(new Set());
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
          {/* Week Navigation Controls */}
          <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-lg shadow">
            <div className="flex items-center gap-4">
              {currentWeekIndex === 0 ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => addWeek('previous')}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
                  >
                    <span>+ Add Previous Week</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCurrentWeekIndex(prev => Math.max(0, prev - 1))}
                  className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                >
                  ← Previous Week
                </button>
              )}

              <button
                onClick={handleGoToCurrentWeek}
                className="px-4 py-2 rounded bg-purple-500 text-white hover:bg-purple-600 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Current Week
              </button>

              {currentWeekIndex >= weeks.length - 1 ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => addWeek('next')}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
                  >
                    <span>+ Add Next Week</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCurrentWeekIndex(prev => prev + 1)}
                  className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                >
                  Next Week →
                </button>
              )}
            </div>

            <div className="text-gray-600 flex items-center gap-4">
              <span>Week {currentWeekIndex + 1} of {weeks.length}</span>
              {currentWeekIndex === weeks.length - 1 && (
                <span className="text-amber-600 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Add a new week to continue
                </span>
              )}
            </div>
          </div>

          {/* Current Week Info */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">
              Week: {formatDateWithAbbreviatedMonth(new Date(currentWeek.startDate))} to{' '}
              {formatDateWithAbbreviatedMonth(new Date(currentWeek.days[6]))}
            </h2>
          </div>

          {/* Table section */}
          <div className="mt-4 overflow-x-auto">
            <div className="max-h-[70vh] overflow-y-auto">
              <table className="min-w-full border-collapse border relative">
                <thead className="bg-gray-50 sticky top-0 z-20">
                  <tr>
                    <th className="w-8 px-2 py-3 border-b"></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-30 border-b">
                      Staff Member
                    </th>
                    {currentWeek.days.map((day, index) => (
                      <th
                        key={index}
                        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b ${
                          index === 5 || index === 6 ? 'bg-gray-100' : 'bg-gray-50'
                        }`}
                      >
                        {new Date(day).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          weekday: 'short',
                        })}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentWeek.staff.map((staff) => {
                    const rowKey = `row-${currentWeek.id}-${staff.id}`;
                    return (
                      <tr key={rowKey} className={selectedStaffToRemove.has(staff.id) ? 'bg-red-50' : ''}>
                        <td className="w-8 px-2 py-4 border-r">
                          <input
                            type="checkbox"
                            checked={selectedStaffToRemove.has(staff.id)}
                            onChange={() => toggleStaffSelection(staff.id)}
                            className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                          />
                        </td>
                        <td className="sticky left-0 z-10 bg-white border-r border-gray-300">
                          <div className="truncate max-w-[150px] px-6 py-4" title={staff.name}>
                            {staff.name}
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
                                shift={staff.shifts[dayIndex] || ''}
                                onShiftsChange={handleShiftsChange.bind(
                                  null,
                                  currentWeek.id
                                )}
                                staffShifts={currentWeek.staff.filter(
                                  (s) =>
                                    s.originalStaffId === staff.originalStaffId &&
                                    s.id === staff.id
                                )}
                                comment={comments[`${currentWeek.id}-${staff.id}-${dayIndex}`]}
                                onAddComment={(comment) => handleAddComment(currentWeek.id, staff.id, dayIndex, comment)}
                                onDeleteComment={() => handleDeleteComment(currentWeek.id, staff.id, dayIndex)}
                                weekId={currentWeek.id}
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

            {/* Staff Management Buttons */}
            <div className="mt-4 mb-4 flex gap-4">
              <button
                onClick={() => setShowBulkAddModal(true)}
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 flex items-center gap-2 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                </svg>
                Add Staff to Week
              </button>

              {selectedStaffToRemove.size > 0 && (
                <button
                  onClick={handleRemoveSelectedStaff}
                  className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 flex items-center gap-2 shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Remove Selected ({selectedStaffToRemove.size})
                </button>
              )}

              {currentWeek.staff.length > 0 && selectedStaffToRemove.size === 0 && (
                <button
                  onClick={() => setShowRemoveAllConfirm(true)}
                  className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 flex items-center gap-2 shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Remove All Staff
                </button>
              )}
            </div>

            {/* Bulk Add Staff Modal */}
            {showBulkAddModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Add Staff to Week</h2>
                    <button
                      onClick={() => {
                        setShowBulkAddModal(false);
                        setSelectedStaff(new Set());
                        setStaffSearchTerm('');
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search staff by name or role..."
                        value={staffSearchTerm}
                        onChange={(e) => setStaffSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg pl-10"
                      />
                      <svg
                        className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>

                  {getAvailableStaff().length > 0 && (
                    <div className="flex items-center mb-4 border-b pb-3">
                      <button
                        onClick={selectedStaff.size === getAvailableStaff().length ? handleDeselectAllStaff : handleSelectAllStaff}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          {selectedStaff.size === getAvailableStaff().length ? (
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          ) : (
                            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                          )}
                        </svg>
                        <span className="font-medium">
                          {selectedStaff.size === getAvailableStaff().length ? 'Deselect All Staff' : 'Select All Staff'}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({getAvailableStaff().length} available)
                        </span>
                      </button>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto mb-4">
                    {getAvailableStaff().length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        All staff members have been added to this week.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {getAvailableStaff().map(staff => (
                          <div
                            key={staff.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedStaff.has(staff.id)
                                ? 'bg-blue-50 border-blue-500'
                                : 'hover:bg-gray-50 border-gray-200'
                            }`}
                            onClick={() => setSelectedStaff(prev => {
                              const newSet = new Set(prev);
                              if (newSet.has(staff.id)) {
                                newSet.delete(staff.id);
                              } else {
                                newSet.add(staff.id);
                              }
                              return newSet;
                            })}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selectedStaff.has(staff.id)}
                                onChange={() => setSelectedStaff(prev => {
                                  const newSet = new Set(prev);
                                  if (newSet.has(staff.id)) {
                                    newSet.delete(staff.id);
                                  } else {
                                    newSet.add(staff.id);
                                  }
                                  return newSet;
                                })}
                                className="h-4 w-4 text-blue-600"
                              />
                              <div>
                                <div className="font-medium">{staff.name}</div>
                                <div className="text-sm text-gray-500">{staff.role}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      onClick={() => {
                        setShowBulkAddModal(false);
                        setSelectedStaff(new Set());
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBulkAddStaff}
                      disabled={selectedStaff.size === 0}
                      className={`px-4 py-2 rounded ${
                        selectedStaff.size === 0
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      Add Selected Staff ({selectedStaff.size})
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Remove All Confirmation Modal */}
            {showRemoveAllConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Remove All Staff</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Are you sure you want to remove all staff from this week? This action cannot be undone.
                    </p>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => setShowRemoveAllConfirm(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRemoveAllStaff}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Yes, Remove All
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
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

      <ConfirmationModal
        isOpen={showRemoveConfirm}
        onClose={() => {
          setShowRemoveConfirm(false);
          setStaffToRemove(null);
        }}
        onConfirm={confirmRemoveStaff}
        title="Remove Staff Member"
        message={staffToRemove ? `Are you sure you want to remove ${staffToRemove.name} from the staff list?` : ''}
      />
    </div>
  );
}