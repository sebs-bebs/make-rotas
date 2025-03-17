import React, { createContext, useContext } from 'react';

// Create a context with dummy values and functions
const DebugContext = createContext();

// NoOp version of the debug provider that does nothing performance-intensive
export const NoOpDebugProvider = ({ children }) => {
  // NoOp functions
  const toggleDebug = () => {};
  const updateDebugVariables = () => {};

  return (
    <DebugContext.Provider value={{ 
      isDebugVisible: false, 
      toggleDebug, 
      debugVariables: {},
      updateDebugVariables 
    }}>
      {children}
    </DebugContext.Provider>
  );
};

// Export the hook for components to use
export const useNoOpDebug = () => {
  const context = useContext(DebugContext);
  if (!context) {
    throw new Error('useNoOpDebug must be used within a NoOpDebugProvider');
  }
  return context;
};
