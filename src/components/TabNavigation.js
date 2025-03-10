// This component creates a tab system to organize different sections of our app
// It's like having different sections in a folder, where you can click tabs to see different content

import React, { useCallback } from 'react';
import { useDebug } from './Debug';
import ShiftTable from './ShiftTable';
import StaffList from './StaffList';
import TestPage from './TestPage';

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
      const timestamp = new Date().toLocaleTimeString();
      updateDebugVariables({
        TabNavigation: {
          activeTab: {
            value: activeTab,
            lastUpdated: timestamp,
            type: "string",
            description: "Currently active tab"
          },
          activeComponents: {
            value: {
              ShiftTable: activeTab === "ShiftTable",
              StaffList: activeTab === "StaffList",
              TestPage: activeTab === "TestPage",
              TabNavigation: true,
              StaffDetail: true
            },
            lastUpdated: timestamp,
            type: "object",
            description: "Active state of each component"
          },
          localStorage: {
            value: {
              activeTab: localStorage.getItem('activeTab'),
              hasVisited: localStorage.getItem('hasVisited'),
              lastUpdated: new Date().toISOString()
            },
            type: "object",
            description: "Current tab-related data in localStorage"
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
        <nav className="tab-navigation flex w-full h-12 border-b border-gray-200 sm:px-6 sm:text-base" aria-label="Main navigation">
          {/* First tab - becomes blue when selected */}
          <button
            className={`flex items-center px-4 py-2 cursor-pointer ${
              activeTab === "ShiftTable" ? "font-bold text-blue-500" : ""
            }`}
            onClick={() => handleTabChange("ShiftTable")}
            aria-current={activeTab === "ShiftTable" ? "page" : undefined}
          >
            Shift Table
          </button>
          {/* Second tab - becomes blue when selected */}
          <button
            className={`flex items-center px-4 py-2 cursor-pointer ${
              activeTab === "StaffList" ? "font-bold text-blue-500" : ""
            }`}
            onClick={() => handleTabChange("StaffList")}
            aria-current={activeTab === "StaffList" ? "page" : undefined}
          >
            Staff List
          </button>
          {/* Test tab - becomes blue when selected */}
          <button
            className={`flex items-center px-4 py-2 cursor-pointer ${
              activeTab === "TestPage" ? "font-bold text-blue-500" : ""
            }`}
            onClick={() => handleTabChange("TestPage")}
            aria-current={activeTab === "TestPage" ? "page" : undefined}
          >
            Test
          </button>
        </nav>
        {/* Area below the tabs where the content is displayed */}
        <div className="tab-content mt-4 flex flex-col">
          {/* Show ShiftTable when ShiftTable is selected */}
          {activeTab === "ShiftTable" && <ShiftTable />}
          {/* Show StaffList when StaffList is selected */}
          {activeTab === "StaffList" && <StaffList />}
          {/* Show TestPage when TestPage is selected */}
          {activeTab === "TestPage" && <TestPage />}
        </div>
      </div>
    );
  }

  export default TabNavigation;