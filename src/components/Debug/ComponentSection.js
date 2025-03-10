import React from 'react';
import { useDebug } from './DebugContext';

const ComponentSection = ({ componentName, variables, isOpen, onToggle }) => {
  const { debugVariables } = useDebug();
  
  // Determine if component is active based on specific rules
  const isActive = React.useMemo(() => {
    // TabNavigation and StaffDetail are always active
    if (componentName === 'TabNavigation' || componentName === 'StaffDetail') {
      return true;
    }

    // For other components, check TabNavigation's activeComponents
    const activeComponents = debugVariables?.TabNavigation?.activeComponents?.value;
    return activeComponents ? activeComponents[componentName] : false;
  }, [componentName, debugVariables?.TabNavigation?.activeComponents?.value]);

  // Only show component sections that we explicitly want to track
  const validComponents = ['StaffDetail', 'TabNavigation', 'StaffList', 'ShiftTable'];
  if (!validComponents.includes(componentName)) return null;

  // If this component doesn't have variables yet, show empty state
  const displayVariables = variables || {};

  return (
    <div className="border-b border-green-400/20 pb-4">
      <div 
        className="flex items-center justify-between cursor-pointer py-2"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-2">
          <span className="text-green-400">{isOpen ? '▼' : '▶'}</span>
          <h4 className="text-white font-semibold">{componentName}</h4>
          <span className={`text-xs px-2 py-0.5 rounded ${
            isActive 
              ? 'bg-green-400/20 text-green-400' 
              : 'bg-gray-400/20 text-gray-400'
          }`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      {isOpen && (
        <pre className={`whitespace-pre-wrap text-xs mt-2 pl-4 ${
          !isActive ? 'opacity-50' : ''
        }`}>
          {JSON.stringify(displayVariables, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default ComponentSection;
