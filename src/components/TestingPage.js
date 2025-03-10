// This component is a hidden testing page only accessible via direct URL
// It's not included in the main navigation tabs

import React, { useEffect } from 'react';
import { useDebug } from './Debug';
import FigmaDesign from './FigmaDesign';

function TestingPage() {
  const { updateDebugVariables } = useDebug();
  
  // Update debug information when component mounts
  useEffect(() => {
    const timestamp = new Date().toLocaleTimeString();
    updateDebugVariables({
      TestingPage: {
        state: {
          value: { accessed: true },
          lastUpdated: timestamp,
          type: "object",
          description: "Hidden testing page accessed via URL"
        },
        url: {
          value: "/testing",
          lastUpdated: timestamp,
          type: "string",
          description: "Direct URL path to access this page"
        },
        components: {
          value: ["FigmaDesign"],
          lastUpdated: timestamp,
          type: "array",
          description: "Components being tested on this page"
        }
      }
    });
  }, [updateDebugVariables]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Hidden Testing Page</h1>
      <p className="mb-4">This page is only accessible via direct URL: <code>http://localhost:3000/testing</code></p>
      <p className="mb-4">It's not included in the main tab navigation.</p>
      
      <div className="mt-8 p-4 border border-gray-200 rounded-md">
        <h2 className="text-xl font-semibold mb-2">Figma Design Implementation</h2>
        <p className="mb-4">Implementing design from: <code>https://www.figma.com/design/7apOTuphy19e0zDBAryViy/Ideation?node-id=202-111</code></p>
        
        <div className="mt-4">
          <FigmaDesign />
        </div>
      </div>
    </div>
  );
}

export default TestingPage;
