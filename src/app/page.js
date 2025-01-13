'use client';
import React, { useState, useEffect } from 'react';
import ShiftSlot from '../components/ShiftSlot';
import ShiftRemarks from '../components/ShiftRemarks';
import StaffInput from '../components/StaffInput';
import WeeklyHours from '../components/WeeklyHours';
import Button from '../components/Button';
import { saveAsImage } from '../utils/saveAsImage';
import { calculateWeeklyHours } from '../utils/calculateWeeklyHours';

export default function HomePage() {
  const [staffList, setStaffList] = useState([]);
  const [remarks, setRemarks] = useState([]);

  // Load staff list from localStorage on mount
  useEffect(() => {
    const storedStaffList = localStorage.getItem('staffList');
    if (storedStaffList) {
      setStaffList(JSON.parse(storedStaffList));
    }
  }, []);

  // Save staff list to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('staffList', JSON.stringify(staffList));
  }, [staffList]);

// Adds a new staff member with default "OFF" shifts
const handleAddStaff = (newName) => {
  if (!newName) return;

  // Check if the staff member already exists
  const exists = staffList.some(
    (person) => person.name.toLowerCase() === newName.toLowerCase()
  );
  if (exists) {
    alert('Staff member already exists');
    return;
  }

  // Create a new staff object with default "OFF" shifts
  const newStaff = {
    id: Date.now(),
    name: newName,
    shifts: Array(7).fill('OFF'), // Set all days to "OFF"
  };

  setStaffList((prev) => [...prev, newStaff]);
};


  // Removes a staff member by ID
  const handleRemoveStaff = (id) => {
    setStaffList((prev) => prev.filter((staff) => staff.id !== id));
  };

  // Updates the shift array for a given staff member
  const handleShiftsChange = (staffId, newShifts) => {
    setStaffList((prev) =>
      prev.map((staff) => {
        if (staff.id === staffId) {
          return { ...staff, shifts: newShifts };
        }
        return staff;
      })
    );
  };

  // Add a remark to the remarks array
  const handleAddRemark = (staffId, dayIndex, remarkText) => {
    setRemarks((prev) => [...prev, { staffId, dayIndex, remark: remarkText }]);
  };

  // Remove a remark
  const handleRemoveRemark = (staffId, dayIndex, remarkText) => {
    setRemarks((prev) =>
      prev.filter(
        (r) =>
          !(
            r.staffId === staffId &&
            r.dayIndex === dayIndex &&
            r.remark === remarkText
          )
      )
    );
  };

  // Calculate total hours for one staff member
  const getWeeklyHours = (shifts) => calculateWeeklyHours(shifts);

  // Calculate the grand total across all staff
  const grandTotal = staffList.reduce((acc, staff) => {
    return acc + getWeeklyHours(staff.shifts);
  }, 0);

  // Convert the table to an image
  const handleSaveAsImage = () => {
    saveAsImage('rota-table', 'my-rotas.png');
  };

  return (
    <div>
      {/* Staff Input Section */}
      <div className="flex gap-4 mb-6">
        <StaffInput onAddStaff={handleAddStaff} />
      </div>

      {/* Table Wrapper */}
      <div className="overflow-x-auto">
        <div id="rota-table" className="bg-white p-6 shadow rounded-md">
          <table className="table-auto w-full border-separate border-spacing-0 md:border-spacing-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 border">STAFF</th>
                <th className="px-6 py-3 border">MON 13 Jan</th>
                <th className="px-6 py-3 border">TUE 14 Jan</th>
                <th className="px-6 py-3 border">WED 15 Jan</th>
                <th className="px-6 py-3 border">THU 16 Jan</th>
                <th className="px-6 py-3 border">FRI 17 Jan</th>
                <th className="px-6 py-3 border">SAT 18 Jan</th>
                <th className="px-6 py-3 border">SUN 19 Jan</th>
                <th className="px-6 py-3 border">TOTAL HOURS</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((staff) => {
                const totalHours = getWeeklyHours(staff.shifts);
                return (
                  <tr key={staff.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 border">
                      <div className="flex items-center justify-between">
                        <span>{staff.name}</span>
                        <Button
                          onClick={() => handleRemoveStaff(staff.id)}
                          className="text-red-500 hover:underline bg-transparent px-2 py-1"
                        >
                          x
                        </Button>
                      </div>
                    </td>
                    {staff.shifts.map((shift, dayIndex) => (
                      <td key={dayIndex} className="px-6 py-3 border">
                        <ShiftSlot
                          staffId={staff.id}
                          dayIndex={dayIndex}
                          shift={shift}
                          onShiftsChange={handleShiftsChange}
                          staffShifts={staff.shifts}
                        />
                        <ShiftRemarks
                          staffId={staff.id}
                          dayIndex={dayIndex}
                          remarks={remarks.filter(
                            (r) =>
                              r.staffId === staff.id && r.dayIndex === dayIndex
                          )}
                          onAddRemark={handleAddRemark}
                          onRemoveRemark={handleRemoveRemark}
                        />
                      </td>
                    ))}
                    <td className="px-6 py-3 border text-center font-bold">
                      {totalHours.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* GRAND TOTAL */}
          <div className="text-right mt-6 font-bold text-xl">
            GRAND TOTAL <span className="ml-2">{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Save as Image Button */}
      <div className="mt-6 flex justify-end">
        <Button onClick={handleSaveAsImage}>Save as Image</Button>
      </div>
    </div>
  );
}
