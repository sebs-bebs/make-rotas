import { useCallback } from 'react';

const useDebugTracker = () => {
  // Returns an empty object and a no-op function that does nothing
  const trackVariable = useCallback(() => {}, []);
  
  return { 
    debugVariables: {}, 
    trackVariable 
  };
};

export default useDebugTracker;
