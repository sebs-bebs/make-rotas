import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { initializeDebugStorage, saveDebugState, loadAllDebugState } from '../../utils/debugStorage';

const DebugContext = createContext();

export const DebugProvider = ({ children }) => {
  const [isDebugVisible, setIsDebugVisible] = useState(false);
  const [debugVariables, setDebugVariables] = useState({});

  // Initialize debug storage on first load
  useEffect(() => {
    initializeDebugStorage();
    const savedState = loadAllDebugState();
    if (savedState?.components) {
      setDebugVariables(savedState.components);
    }
  }, []);

  const toggleDebug = () => setIsDebugVisible(prev => !prev);
  
  // Optimized update function that only updates when values actually change
  const updateDebugVariables = useCallback((newVariables) => {
    setDebugVariables(prev => {
      // Deep compare the new values with previous values
      const hasChanges = Object.entries(newVariables).some(([componentName, componentVars]) => {
        if (!prev[componentName]) return true;
        
        return Object.entries(componentVars).some(([varName, newValue]) => {
          const prevValue = prev[componentName][varName];
          if (!prevValue) return true;
          
          // Compare stringified values to handle objects and arrays
          return JSON.stringify(prevValue.value) !== JSON.stringify(newValue.value);
        });
      });

      if (!hasChanges) {
        return prev;
      }

      // Create new object without mutating previous state
      const nextState = { ...prev };
      
      // Update components and save to storage
      Object.entries(newVariables).forEach(([componentName, componentVars]) => {
        nextState[componentName] = {
          ...nextState[componentName],
          ...componentVars
        };
        // Save each component's state separately
        saveDebugState(componentName, nextState[componentName]);
      });

      return nextState;
    });
  }, []); // Empty dependency array since this function only uses setState

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
