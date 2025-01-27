// This component creates a tab system to organize different sections of our app
// It's like having different sections in a folder, where you can click tabs to see different content

import React, { useCallback } from 'react';
import { useDebug } from './Debug';
import ShiftTable from './ShiftTable';
import StaffList from './StaffList';

function TabNavigation() {
    // Load the active tab from localStorage or default to "Tab 1"
    const [activeTab, setActiveTab] = React.useState(() => {
      return localStorage.getItem('activeTab') || "Tab 1";
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
              ShiftTable: activeTab === "Tab 1",
              StaffList: activeTab === "Tab 2",
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
              activeTab === "Tab 1" ? "font-bold text-blue-500" : ""
            }`}
            onClick={() => handleTabChange("Tab 1")}
          >
            Shift Table
          </a>
          {/* Second tab - becomes blue when selected */}
          <a
            className={`flex items-center px-4 py-2 cursor-pointer ${
              activeTab === "Tab 2" ? "font-bold text-blue-500" : ""
            }`}
            onClick={() => handleTabChange("Tab 2")}
          >
            Staff List
          </a>
        </div>
        {/* Area below the tabs where the content is displayed */}
        <div className="tab-content mt-4 flex flex-col">
          {/* Show ShiftTable when Tab 1 is selected */}
          {activeTab === "Tab 1" && <ShiftTable />}
          {/* Show StaffList when Tab 2 is selected */}
          {activeTab === "Tab 2" && <StaffList />}
        </div>
      </div>
    );
  }

  export default TabNavigation;