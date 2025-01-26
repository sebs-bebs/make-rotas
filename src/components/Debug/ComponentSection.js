import React from 'react';

const ComponentSection = ({ componentName, variables, isOpen, onToggle }) => {
  return (
    <div className="border-b border-green-400/20 pb-4">
      <div 
        className="flex items-center justify-between cursor-pointer py-2"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-2">
          <span className="text-green-400">{isOpen ? '▼' : '▶'}</span>
          <h4 className="text-white font-semibold">{componentName}</h4>
        </div>
      </div>
      {isOpen && (
        <pre className="whitespace-pre-wrap text-xs mt-2 pl-4">
          {JSON.stringify(variables, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default ComponentSection;
