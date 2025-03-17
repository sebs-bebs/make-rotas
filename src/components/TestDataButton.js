import React, { useState } from 'react';
import { generateAllTestData } from '../utils/generateTestData';

/**
 * TestDataButton Component
 * 
 * A fixed position button that generates test data for the application.
 * Uses the generateTestData utility to create staff and shift data.
 */
const TestDataButton = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGenerateData = async () => {
    try {
      setIsGenerating(true);
      
      // Generate test data with 50 staff members
      const result = await generateAllTestData(50);
      
      if (result.success) {
        alert(`Success! Generated ${result.staffCount} staff members with shifts. Refresh the page to see the data.`);
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error generating test data:', error);
      alert(`Error generating test data: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <button
      onClick={handleGenerateData}
      disabled={isGenerating}
      className="fixed bottom-4 right-4 px-4 py-2 bg-green-500 text-white rounded-md shadow-lg hover:bg-green-600 transition-colors duration-300 flex items-center justify-center"
      style={{ zIndex: 9999 }}
    >
      {isGenerating ? 'Generating...' : 'Generate Test Data'}
    </button>
  );
};

export default TestDataButton;
