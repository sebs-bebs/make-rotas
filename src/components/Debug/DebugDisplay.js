import React, { useState, useMemo, useEffect } from 'react';
import { useDebug } from './DebugContext';
import { useStaffDetail } from '../../context/StaffDetailContext';
import ComponentSection from './ComponentSection';

const DebugDisplay = () => {
  const { isDebugVisible, debugVariables, toggleDebug, updateDebugVariables } = useDebug();
  const { staffMembers } = useStaffDetail();
  const [searchTerm, setSearchTerm] = useState('');
  const [openSections, setOpenSections] = useState(new Set());

  // Update staff details in debug display
  useEffect(() => {
    updateDebugVariables({
      StaffDetail: {
        staffMembers: {
          value: staffMembers.map(staff => ({
            staffID: staff.staffID,
            fullName: staff.fullName,
            role: staff.role,
            inList: staff.inList
          })),
          lastUpdated: new Date().toLocaleTimeString(),
          type: "array"
        }
      }
    });
  }, [staffMembers, updateDebugVariables]);

  const filteredComponents = useMemo(() => {
    return Object.entries(debugVariables).filter(([componentName, variables]) => {
      const lowerSearch = searchTerm.toLowerCase();
      return (
        componentName.toLowerCase().includes(lowerSearch) ||
        JSON.stringify(variables).toLowerCase().includes(lowerSearch)
      );
    });
  }, [debugVariables, searchTerm]);

  const toggleSection = (componentName) => {
    setOpenSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(componentName)) {
        newSet.delete(componentName);
      } else {
        newSet.add(componentName);
      }
      return newSet;
    });
  };

  const toggleAllSections = () => {
    if (openSections.size === Object.keys(debugVariables).length) {
      setOpenSections(new Set());
    } else {
      setOpenSections(new Set(Object.keys(debugVariables)));
    }
  };

  if (!isDebugVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={toggleDebug}
      />
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/90 text-green-400 p-6 font-mono text-sm rounded-lg max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col z-50 border border-green-400/30">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-bold">Debug Variables</h3>
          <button 
            onClick={toggleDebug}
            className="text-green-400 hover:text-green-300 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Search and Controls */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search variables..."
              className="w-full bg-black/50 border border-green-400/30 rounded px-3 py-1 text-green-400 placeholder-green-400/50 focus:outline-none focus:border-green-400"
            />
          </div>
          <button
            onClick={toggleAllSections}
            className="text-xs text-green-400 hover:text-green-300 transition-colors"
          >
            {openSections.size === Object.keys(debugVariables).length ? 'Collapse All' : 'Expand All'}
          </button>
        </div>

        {/* Component Sections */}
        <div className="space-y-4 overflow-y-auto">
          {filteredComponents.map(([componentName, variables]) => (
            <ComponentSection
              key={componentName}
              componentName={componentName}
              variables={variables}
              isOpen={openSections.has(componentName)}
              onToggle={() => toggleSection(componentName)}
            />
          ))}
          {filteredComponents.length === 0 && (
            <div className="text-center text-green-400/50 py-4">
              No matching variables found
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DebugDisplay;
