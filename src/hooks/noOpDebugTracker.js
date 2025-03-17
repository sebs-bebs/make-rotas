import { useCallback } from 'react';

// NoOp version of the useDebugTracker hook
const noOpDebugTracker = () => {
  // Returns an empty object and a no-op function
  const trackVariable = useCallback(() => {}, []);
  
  return { 
    debugVariables: {}, 
    trackVariable 
  };
};

export default noOpDebugTracker;
