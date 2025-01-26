import React, { createContext, useContext, useState } from 'react';

const StaffContext = createContext();

export function StaffProvider({ children }) {
  const [staffNumber, setStaffNumber] = useState(0);

  const updateStaffNumber = (value) => {
    const number = Math.max(0, Math.floor(Number(value)));
    if (!isNaN(number)) {
      setStaffNumber(number);
    }
  };

  return (
    <StaffContext.Provider value={{ staffNumber, updateStaffNumber }}>
      {children}
    </StaffContext.Provider>
  );
}

export const useStaffNumber = () => {
  const context = useContext(StaffContext);
  if (!context) {
    throw new Error('useStaffNumber must be used within StaffProvider');
  }
  return context;
};
