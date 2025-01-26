import React, { useCallback } from 'react';
import { useDebug } from './Debug';

function TabNavigation() {
    const [activeTab, setActiveTab] = React.useState("Tab 1");
    const { updateDebugVariables } = useDebug();

    // Memoize the debug update to prevent unnecessary updates
    const updateDebug = useCallback(() => {
      updateDebugVariables({
        TabNavigation: {
          activeTab: {
            value: activeTab,
            lastUpdated: new Date().toLocaleTimeString(),
            type: "string"
          }
        }
      });
    }, [activeTab, updateDebugVariables]);

    // Track activeTab changes
    React.useEffect(() => {
      updateDebug();
    }, [updateDebug]);

    return (
      <div className="tab-navigation flex w-full h-12 border-b border-gray-200 sm:px-6 sm:text-base">
        <a
          className={`flex items-center px-4 py-2 cursor-pointer ${
            activeTab === "Tab 1" ? "font-bold text-blue-500" : ""
          }`}
          onClick={() => setActiveTab("Tab 1")}
        >
          Tab 1
        </a>
        <a
          className={`flex items-center px-4 py-2 cursor-pointer ${
            activeTab === "Tab 2" ? "font-bold text-blue-500" : ""
          }`}
          onClick={() => setActiveTab("Tab 2")}
        >
          Tab 2
        </a>
      </div>
    );
  }

  export default TabNavigation;