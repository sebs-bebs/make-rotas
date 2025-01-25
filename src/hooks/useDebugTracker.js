import { useState, useCallback } from 'react';

const useDebugTracker = (initialVariables = {}) => {
  const [debugVariables, setDebugVariables] = useState(initialVariables);

  const trackVariable = useCallback((key, newValue) => {
    setDebugVariables(prev => {
      // Only update if the value has actually changed
      if (prev[key]?.value === newValue) {
        return prev;
      }
      
      return {
        ...prev,
        [key]: {
          value: newValue,
          lastUpdated: new Date().toLocaleTimeString(),
          type: typeof newValue,
        }
      };
    });
  }, []);

  return { debugVariables, trackVariable };
};

export default useDebugTracker;
