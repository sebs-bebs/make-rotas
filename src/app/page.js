// src/app/page.js
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ShiftSlot from '../components/ShiftSlot';
import ShiftRemarks from '../components/ShiftRemarks';
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
  const [rotaStaffSearchTerm, setRotaStaffSearchTerm] = useState('');

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

  useEffect(() => {
    // Create weeks automatically when reaching penultimate position
    if (currentWeekIndex >= weeks.length - 2) {
      // Create next week
      addWeek('next');
    }
    if (currentWeekIndex <= 1) {
      // Create previous week
      addWeek('previous');
    }
  }, [currentWeekIndex, weeks.length]);

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

  const handleExportRota = () => {
    const currentWeek = weeks[currentWeekIndex];
    const startDate = new Date(currentWeek.days[0]);
    const endDate = new Date(currentWeek.days[6]);
    const filename = `rota-${formatDateWithAbbreviatedMonth(startDate, 'dd/MM/yyyy')} to ${formatDateWithAbbreviatedMonth(endDate, 'dd/MM/yyyy')}.png`;
    saveAsImage('rota-table', filename);
  };

  // Ensure we always have a valid currentWeek
  const currentWeek = weeks[currentWeekIndex] || initialWeek;

  return (
    <div className="container mx-auto px-4 pt-1 pb-2">
      {/* Tab Navigation */}
      <div role="tablist" className="flex border-b border-gray-200 mb-4">
        <nav className="-mb-px flex gap-4">
          <button
            onClick={() => setActiveTab('rota')}
            className={`py-1 px-2 text-sm font-medium ${
              activeTab === 'rota'
                ? 'border-b-2 border-blue-500 text-blue-600 font-semibold'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Rota
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`py-1 px-2 text-sm font-medium ${
              activeTab === 'staff'
                ? 'border-b-2 border-blue-500 text-blue-600 font-semibold'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Staff List
          </button>
        </nav>
      </div>

      {/* Rota Tab Content */}
      {activeTab === 'rota' && (
        <div className="flex flex-col gap-4">
          {/* Current Week Info */}
          <div className="text-lg font-semibold text-gray-800">
            Week: {formatDateWithAbbreviatedMonth(new Date(currentWeek.days[0]), 'dd/MM/yyyy')} to{' '}
            {formatDateWithAbbreviatedMonth(new Date(currentWeek.days[6]), 'dd/MM/yyyy')}
          </div>

          {/* Table section */}
          <div className="mt-4 overflow-x-auto">
            {/* Week Navigation Controls */}
            <div className="flex items-center gap-1 mb-4">
              <button
                onClick={() => {
                  if (currentWeekIndex === 0) {
                    addWeek('previous');
                  }
                  setCurrentWeekIndex(prev => Math.max(0, prev - 1));
                }}
                className="h-8 flex items-center justify-center p-1.5 bg-transparent text-gray-500 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </button>

              <button
                onClick={() => {
                  if (currentWeekIndex >= weeks.length - 1) {
                    addWeek('next');
                  }
                  setCurrentWeekIndex(prev => prev + 1);
                }}
                className="h-8 flex items-center justify-center p-1.5 bg-transparent text-gray-500 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>

              <button
                onClick={handleGoToCurrentWeek}
                className="h-8 px-3 rounded-full bg-transparent border border-gray-600 text-gray-600 hover:border-gray-700 hover:text-gray-700 text-sm font-medium ml-4"
              >
                Current Week
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b">
                  <div className="relative">
                    <input
                      type="text"
                      value={rotaStaffSearchTerm}
                      onChange={(e) => setRotaStaffSearchTerm(e.target.value)}
                      placeholder="Search staff by name or role..."
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                <table id="rota-table" className="min-w-full bg-white border border-gray-300">
                  <thead className="bg-gray-50 sticky top-0 z-20">
                    <tr>
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
                    {currentWeek.staff
                      .filter(staff => 
                        !rotaStaffSearchTerm ||
                        staff.name.toLowerCase().includes(rotaStaffSearchTerm.toLowerCase()) ||
                        staff.role.toLowerCase().includes(rotaStaffSearchTerm.toLowerCase())
                      )
                      .map((staff) => {
                        const rowKey = `row-${currentWeek.id}-${staff.id}`;
                        return (
                          <tr key={rowKey} className={selectedStaffToRemove.has(staff.id) ? 'bg-red-50' : ''}>
                            <td className="sticky left-0 z-10 bg-white">
                              <div className="truncate max-w-[165px] px-6 py-4 flex items-center" title={staff.name}>
                                <input
                                  type="checkbox"
                                  checked={selectedStaffToRemove.has(staff.id)}
                                  onChange={() => toggleStaffSelection(staff.id)}
                                  className="h-4 w-4 text-blue-600 mr-2"
                                />
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
            </div>

            {/* Staff Management Buttons */}
            <div className="mt-4 mb-4 flex justify-between">
              <div className="flex gap-4">
                <button
                  onClick={() => setShowBulkAddModal(true)}
                  className="w-[160px] h-10 flex items-center justify-center px-5 bg-gray-800 text-white font-semibold rounded-full hover:bg-gray-700"
                >
                  Add Staff
                </button>

                {selectedStaffToRemove.size > 0 && (
                  <button
                    onClick={handleRemoveSelectedStaff}
                    className="w-[160px] h-10 flex items-center justify-center px-5 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600"
                  >
                    Remove Staff
                  </button>
                )}

                {currentWeek.staff.length > 0 && selectedStaffToRemove.size === 0 && (
                  <button
                    onClick={() => setShowRemoveAllConfirm(true)}
                    className="w-[180px] h-10 flex items-center justify-center px-5 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600"
                  >
                    Remove All Staff
                  </button>
                )}
              </div>

              <button 
                onClick={handleExportRota}
                className="w-[160px] h-10 flex items-center justify-center px-5 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600"
              >
                Save as Image
              </button>
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

                  {staffList.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-yellow-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Staff Members Found</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        You need to add staff members to your staff list before you can add them to the rota.
                      </p>
                      <button
                        onClick={() => {
                          setShowBulkAddModal(false);
                          setActiveTab('staff');
                        }}
                        className="px-4 py-2 bg-gray-800 text-white font-semibold rounded-full hover:bg-gray-700 inline-flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                        </svg>
                        Go to Staff List
                      </button>
                    </div>
                  ) : (
                    <>
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
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                            />
                          </svg>
                        </div>
                      </div>

                      {getAvailableStaff().length > 0 && (
                        <div className="flex items-center mb-4 border-b pb-3">
                          <button
                            onClick={selectedStaff.size === getAvailableStaff().length ? handleDeselectAllStaff : handleSelectAllStaff}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors font-semibold"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              {selectedStaff.size === getAvailableStaff().length ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
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
                          <div className="overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="w-8 pl-2 pr-0 py-2">
                                    <span className="sr-only">Select</span>
                                  </th>
                                  <th scope="col" className="w-[180px] pl-0 pr-1 py-2 text-left text-sm font-medium text-gray-600">
                                    NAME
                                  </th>
                                  <th scope="col" className="pl-1 pr-3 py-2 text-left text-sm font-medium text-gray-600">
                                    ROLE
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {getAvailableStaff().map(staff => (
                                  <tr
                                    key={staff.id}
                                    onClick={() => setSelectedStaff(prev => {
                                      const newSet = new Set(prev);
                                      if (newSet.has(staff.id)) {
                                        newSet.delete(staff.id);
                                      } else {
                                        newSet.add(staff.id);
                                      }
                                      return newSet;
                                    })}
                                    className={`cursor-pointer transition-colors ${
                                      selectedStaff.has(staff.id)
                                        ? 'bg-blue-50'
                                        : 'hover:bg-gray-50'
                                    }`}
                                  >
                                    <td className="pl-2 pr-0 py-2 whitespace-nowrap w-8">
                                      <label className="inline-flex items-center cursor-pointer" onClick={e => e.stopPropagation()}>
                                        <input
                                          type="checkbox"
                                          checked={selectedStaff.has(staff.id)}
                                          onChange={(e) => {
                                            e.stopPropagation();
                                            setSelectedStaff(prev => {
                                              const newSet = new Set(prev);
                                              if (newSet.has(staff.id)) {
                                                newSet.delete(staff.id);
                                              } else {
                                                newSet.add(staff.id);
                                              }
                                              return newSet;
                                            });
                                          }}
                                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                      </label>
                                    </td>
                                    <td className="pl-0 pr-1 py-2 whitespace-nowrap">
                                      <div className="font-medium text-gray-900 truncate w-[280px]" title={staff.name}>{staff.name}</div>
                                    </td>
                                    <td className="pl-1 pr-3 py-2 whitespace-nowrap">
                                      <div className="text-gray-500">{staff.role}</div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                          onClick={() => {
                            setShowBulkAddModal(false);
                            setSelectedStaff(new Set());
                            setStaffSearchTerm('');
                          }}
                          className="bg-transparent text-gray-700 hover:text-gray-600 font-regular py-2 px-4 rounded-full text-sm hover:underline"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleBulkAddStaff}
                          disabled={selectedStaff.size === 0}
                          className={`text-white px-6 py-2 rounded-full ${
                            selectedStaff.size === 0
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-gray-700 hover:bg-gray-800'
                          } font-semibold`}
                        >
                          Add Selected Staff ({selectedStaff.size})
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Remove All Confirmation Modal */}
            {showRemoveAllConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Remove All Staff</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Are you sure you want to remove all staff from this week? This action cannot be undone.
                    </p>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => setShowRemoveAllConfirm(false)}
                        className="bg-transparent text-gray-700 hover:text-gray-600 font-regular py-2 px-4 rounded-full text-sm hover:underline"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRemoveAllStaff}
                        className="w-[160px] h-10 flex justify-center items-center gap-1 bg-red-500 text-white font-medium rounded-full hover:bg-red-600"
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