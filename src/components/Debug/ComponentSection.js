import React from 'react';
import { useDebug } from './DebugContext';

const ComponentSection = ({ componentName, variables, isOpen, onToggle }) => {
  const { debugVariables } = useDebug();
  
  // Check if component is active based on TabNavigation's activeComponents
  const isActive = debugVariables?.TabNavigation?.activeComponents?.value?.[componentName] ?? true;

  // Only show component sections that we explicitly want to track
  const validComponents = ['StaffDetail', 'TabNavigation', 'StaffList', 'ShiftTable'];
  if (!validComponents.includes(componentName)) return null;

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
          {JSON.stringify(variables, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default ComponentSection;
