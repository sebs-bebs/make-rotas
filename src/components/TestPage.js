// This component serves as a testing ground for various components
// It provides a clean environment to test components in isolation

import React from 'react';
import { useDebug } from './Debug';
import AddButton from './AddButton';
import RemoveButton from './RemoveButton';

function TestPage() {
  const { updateDebugVariables } = useDebug();
  const [testState, setTestState] = React.useState({
    counter: 0
  });

  // Update debug information when test state changes
  React.useEffect(() => {
    const timestamp = new Date().toLocaleTimeString();
    updateDebugVariables({
      TestPage: {
        state: {
          value: testState,
          lastUpdated: timestamp,
          type: "object",
          description: "Current test page state"
        },
        activeComponents: {
          value: ["TestPage", "AddButton", "RemoveButton"],
          lastUpdated: timestamp,
          type: "array",
          description: "Components available for testing"
        }
      }
    });
  }, [testState, updateDebugVariables]);

  const handleIncrement = () => {
    setTestState(prev => ({
      ...prev,
      counter: prev.counter + 1
    }));
  };

  const handleDecrement = () => {
    setTestState(prev => ({
      ...prev,
      counter: Math.max(0, prev.counter - 1)
    }));
  };

  return (
    <div>
      <h1>Component Test Page</h1>
      <div className="mt-4">
        <h2>Test Components</h2>
        
        <div className="mt-4">
          <h3>Button Components</h3>
          <div className="flex items-center gap-4 mt-2">
            <AddButton onClick={handleIncrement} />
            <span>Counter: {testState.counter}</span>
            <RemoveButton onClick={handleDecrement} />
          </div>
        </div>
        
        {/* Additional component test sections can be added here */}
      </div>
    </div>
  );
}

export default TestPage;
