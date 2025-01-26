import React, { createContext, useContext, useState, useCallback } from 'react';

const DebugContext = createContext();

export const DebugProvider = ({ children }) => {
  const [isDebugVisible, setIsDebugVisible] = useState(false);
  const [debugVariables, setDebugVariables] = useState({});

  const toggleDebug = () => setIsDebugVisible(prev => !prev);
  
  // Optimized update function that only updates when values actually change
  const updateDebugVariables = useCallback((newVariables) => {
    setDebugVariables(prev => {
      const hasChanges = Object.entries(newVariables).some(([componentName, componentVars]) => {
        return Object.entries(componentVars).some(([varName, value]) => {
          const prevValue = prev[componentName]?.[varName]?.value;
          return prevValue !== value.value;
        });
      });

      if (!hasChanges) {
        return prev;
      }

      return {
        ...prev,
        ...Object.entries(newVariables).reduce((acc, [componentName, componentVars]) => {
          acc[componentName] = {
            ...prev[componentName],
            ...componentVars
          };
          return acc;
        }, {})
      };
    });
  }, []);

  return (
    <DebugContext.Provider value={{ 
      isDebugVisible, 
      toggleDebug, 
      debugVariables,
      updateDebugVariables 
    }}>
      {children}
    </DebugContext.Provider>
  );
};

export const useDebug = () => {
  const context = useContext(DebugContext);
  if (!context) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
};
