// This file re-exports all debug components to make imports cleaner
import { DebugProvider, useDebug } from './DebugContext';
import NoOpDebugDisplay from './NoOpDebugDisplay';

// Export NoOp versions for use in the application
export { 
  DebugProvider,
  NoOpDebugDisplay as DebugDisplay,
  useDebug
};
