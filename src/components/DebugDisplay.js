import React from 'react';
import { useDebug } from '../context/DebugContext';

const DebugDisplay = () => {
  const { isDebugVisible, debugVariables, toggleDebug } = useDebug();

  if (!isDebugVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={toggleDebug}
      />
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/90 text-green-400 p-6 font-mono text-sm rounded-lg max-w-[500px] max-h-[600px] overflow-auto z-50 border border-green-400/30">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-bold">Debug Variables</h3>
          <button 
            onClick={toggleDebug}
            className="text-green-400 hover:text-green-300 transition-colors"
          >
            ✕
          </button>
        </div>
        <pre className="whitespace-pre-wrap">
          {JSON.stringify(debugVariables, null, 2)}
        </pre>
      </div>
    </>
  );
};

export default DebugDisplay;
