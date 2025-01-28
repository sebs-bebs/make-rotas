// This component creates a tab system to organize different sections of our app
// It's like having different sections in a folder, where you can click tabs to see different content

import React, { useCallback } from 'react';
import { useDebug } from './Debug';
import ShiftTable from './ShiftTable';
import StaffList from './StaffList';

function TabNavigation() {
    // Load the active tab from localStorage or default to ShiftTable for first-time users
    const [activeTab, setActiveTab] = React.useState(() => {
      // Check if this is the first visit
      const isFirstVisit = !localStorage.getItem('hasVisited');
      if (isFirstVisit) {
        localStorage.setItem('hasVisited', 'true');
        localStorage.setItem('activeTab', 'ShiftTable');
        return 'ShiftTable';
      }
      return localStorage.getItem('activeTab') || 'ShiftTable';
    });
    
    const { updateDebugVariables } = useDebug();

    // Update both localStorage and debug info when tab changes
    const handleTabChange = useCallback((tabName) => {
      setActiveTab(tabName);
      localStorage.setItem('activeTab', tabName);
    }, []);

    // This helps us track which tab is active for debugging purposes
    // It's like having a notepad that records which tab we're looking at
    const updateDebug = useCallback(() => {
      updateDebugVariables({
        TabNavigation: {
          activeTab: {
            value: activeTab,
            lastUpdated: new Date().toLocaleTimeString(),
            type: "string"
          },
          activeComponents: {
            value: {
              ShiftTable: activeTab === "ShiftTable",
              StaffList: activeTab === "StaffList",
              TabNavigation: true, // Always active
              StaffDetail: true    // Always active as it's shared
            },
            lastUpdated: new Date().toLocaleTimeString(),
            type: "object"
          }
        }
      });
    }, [activeTab, updateDebugVariables]);

    // Update our debug tracking whenever the active tab changes
    React.useEffect(() => {
      updateDebug();
    }, [updateDebug]);

    return (
      // Main container that holds both the tabs and their content
      <div className="flex flex-col w-full">
        {/* The row of clickable tabs */}
        <div className="tab-navigation flex w-full h-12 border-b border-gray-200 sm:px-6 sm:text-base">
          {/* First tab - becomes blue when selected */}
          <a
            className={`flex items-center px-4 py-2 cursor-pointer ${
              activeTab === "ShiftTable" ? "font-bold text-blue-500" : ""
            }`}
            onClick={() => handleTabChange("ShiftTable")}
          >
            Shift Table
          </a>
          {/* Second tab - becomes blue when selected */}
          <a
            className={`flex items-center px-4 py-2 cursor-pointer ${
              activeTab === "StaffList" ? "font-bold text-blue-500" : ""
            }`}
            onClick={() => handleTabChange("StaffList")}
          >
            Staff List
          </a>
        </div>
        {/* Area below the tabs where the content is displayed */}
        <div className="tab-content mt-4 flex flex-col">
          {/* Show ShiftTable when ShiftTable is selected */}
          {activeTab === "ShiftTable" && <ShiftTable />}
          {/* Show StaffList when StaffList is selected */}
          {activeTab === "StaffList" && <StaffList />}
        </div>
      </div>
    );
  }

  export default TabNavigation;