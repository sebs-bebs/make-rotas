import React, { useState, useMemo, useEffect } from 'react';
import { useDebug } from './DebugContext';
import { useStaffDetail } from '../../context/StaffDetailContext';
import ComponentSection from './ComponentSection';

const DebugDisplay = () => {
  const { isDebugVisible, debugVariables, toggleDebug, updateDebugVariables } = useDebug();
  const { staffMembers } = useStaffDetail();
  const [searchTerm, setSearchTerm] = useState('');
  const [openSections, setOpenSections] = useState(new Set());

  // List of valid components that should always be shown
  const validComponents = ['StaffDetail', 'TabNavigation', 'StaffList', 'ShiftTable'];

  // Update staff details in debug display
  useEffect(() => {
    updateDebugVariables({
      StaffDetail: {
        staffMembers: {
          value: staffMembers.map(staff => ({
            staffID: staff.staffID,
            fullName: staff.fullName,
            role: staff.role,
            comments: staff.comments,
            inList: staff.inList
          })),
          lastUpdated: new Date().toLocaleTimeString(),
          type: "array"
        }
      }
    });
  }, [staffMembers, updateDebugVariables]);

  const filteredComponents = useMemo(() => {
    // Start with all valid components
    return validComponents
      .filter(componentName => {
        const lowerSearch = searchTerm.toLowerCase();
        const variables = debugVariables[componentName] || {};
        return (
          componentName.toLowerCase().includes(lowerSearch) ||
          JSON.stringify(variables).toLowerCase().includes(lowerSearch)
        );
      })
      .map(componentName => [componentName, debugVariables[componentName] || {}]);
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
    if (openSections.size === validComponents.length) {
      setOpenSections(new Set());
    } else {
      setOpenSections(new Set(validComponents));
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
      <div className="fixed inset-0 bg-black/90 text-green-400 font-mono text-sm z-50 border border-green-400/30 p-8">
        {/* Fixed Header */}
        <div className="fixed top-0 left-0 right-0 bg-black/90 border-b border-green-400/30 p-8">
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
          <div className="flex items-center space-x-4">
            <div className="flex-1 w-[120%]">
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
              className="text-xs text-green-400 hover:text-green-300 transition-colors whitespace-nowrap"
            >
              {openSections.size === validComponents.length ? 'Collapse All' : 'Expand All'}
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="mt-36 space-y-6 overflow-auto h-[calc(100vh-8rem)] overflow-x-auto">
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
