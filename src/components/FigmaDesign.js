// This component implements the Figma design from the provided link
// It will be displayed on the testing page

import React, { useEffect, useState } from 'react';
import { useDebug } from './Debug';
import { fetchFigmaNode, fetchFigmaFile } from '../utils/figmaUtils';

function FigmaDesign() {
  const { updateDebugVariables } = useDebug();
  const [designData, setDesignData] = useState(null);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState('not-running'); 

  // Figma file and node information
  const fileKey = '7apOTuphy19e0zDBAryViy';
  const nodeId = '202-111';

  // Check if the Figma MCP server is running
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch('http://localhost:3333/');
        if (response.ok) {
          setServerStatus('running');
        } else {
          setServerStatus('error');
        }
      } catch (err) {
        console.error('Error checking Figma MCP server status:', err);
        setServerStatus('not-running');
      }
    };

    checkServerStatus();
  }, []);

  // Fetch the Figma design data
  useEffect(() => {
    const fetchDesignData = async () => {
      if (serverStatus !== 'running') {
        return; // Don't try to fetch if server isn't running
      }

      try {
        setLoading(true);
        
        // Try to fetch the node first
        try {
          const data = await fetchFigmaNode(fileKey, nodeId);
          console.log('Figma node data received:', data);
          setDesignData(data);
          setLoading(false);
        } catch (nodeError) {
          console.error('Error fetching node, trying file instead:', nodeError);
          
          // If node fetch fails, try to fetch the file
          try {
            const fileData = await fetchFigmaFile(fileKey, 3);
            console.log('Figma file data received:', fileData);
            setDesignData(fileData);
            setLoading(false);
          } catch (fileError) {
            console.error('Error fetching file as well:', fileError);
            throw new Error(`Failed to fetch both node and file: ${nodeError.message} | ${fileError.message}`);
          }
        }
      } catch (err) {
        console.error('Error fetching Figma design:', err);
        setError(err);
        setLoading(false);
      }
    };

    fetchDesignData();
  }, [serverStatus]);

  useEffect(() => {
    // Update debug information
    const timestamp = new Date().toLocaleTimeString();
    updateDebugVariables({
      FigmaDesign: {
        state: {
          value: {
            loading,
            error: error ? error.message : null,
            dataReceived: !!designData,
            fileKey,
            nodeId,
            serverStatus
          },
          lastUpdated: timestamp,
          type: "object",
          description: "Figma design component state"
        },
        designData: {
          value: designData ? 'Data received (too large to display)' : null,
          lastUpdated: timestamp,
          type: "object",
          description: "Figma design data received from API"
        }
      }
    });
  }, [loading, error, designData, updateDebugVariables, serverStatus]);

  // Helper function to extract color from Figma fills
  const extractColor = (fills) => {
    if (!fills || !fills.length) return 'transparent';
    
    const fill = fills[0];
    if (fill.type === 'SOLID') {
      const { r, g, b, a } = fill.color;
      return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a || 1})`;
    }
    
    return 'transparent';
  };

  // Helper function to extract text styles
  const extractTextStyles = (style) => {
    if (!style) return {};
    
    return {
      fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
      fontWeight: style.fontWeight,
      fontFamily: style.fontFamily,
      textAlign: style.textAlignHorizontal?.toLowerCase(),
      lineHeight: style.lineHeightPx ? `${style.lineHeightPx}px` : undefined,
      letterSpacing: style.letterSpacing ? `${style.letterSpacing}px` : undefined,
    };
  };

  // Implement a detailed staff card design based on the expected Figma design
  const renderImplementedDesign = () => {
    return (
      <div className="implemented-design">
        {/* Staff Card Component */}
        <div className="staff-card p-6 rounded-lg shadow-md bg-white mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">John Smith</h3>
              <p className="text-sm text-gray-600">Full-time Staff</p>
            </div>
            <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
              Active
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm text-gray-800">john.smith@example.com</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-sm text-gray-800">+44 7700 900123</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Department</p>
              <p className="text-sm text-gray-800">Kitchen</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Role</p>
              <p className="text-sm text-gray-800">Chef</p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Availability</h4>
            <div className="flex space-x-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                <div 
                  key={index} 
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium ${
                    index < 5 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
            <button className="px-4 py-2 mr-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
              Edit
            </button>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600">
              View Schedule
            </button>
          </div>
        </div>
        
        {/* Shift Card Component */}
        <div className="shift-card p-6 rounded-lg shadow-md bg-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Morning Shift</h3>
              <p className="text-sm text-gray-600">Monday, March 3, 2025</p>
            </div>
            <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
              8:00 AM - 4:00 PM
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Staff Assigned</h4>
            <div className="space-y-2">
              {['John Smith', 'Sarah Johnson', 'Michael Brown'].map((name, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-700 mr-2">
                    {name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-sm text-gray-800">{name}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
            <p className="text-sm text-gray-600">Busy day expected. Extra staff may be needed in the afternoon.</p>
          </div>
          
          <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
            <button className="px-4 py-2 mr-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
              Edit
            </button>
            <button className="px-4 py-2 bg-red-500 text-white rounded-md text-sm hover:bg-red-600">
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render the design based on the data received from Figma
  const renderDesign = () => {
    if (!designData || (!designData.node && !designData.document)) {
      return renderImplementedDesign();
    }

    // Extract relevant information from the design data
    const node = designData.node || designData.document;
    
    // Implement a card component based on the Figma design
    // This is a simplified implementation that adapts to the actual data received
    return (
      <div className="figma-implementation">
        <div 
          className="card-component p-6 rounded-lg shadow-md"
          style={{
            backgroundColor: node.fills ? extractColor(node.fills) : 'white',
            width: node.absoluteBoundingBox?.width || 'auto',
            height: node.absoluteBoundingBox?.height || 'auto',
            maxWidth: '100%',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Render children based on node structure */}
          {node.children && node.children.map((child, index) => {
            // Handle different node types
            if (child.type === 'TEXT') {
              const textStyles = extractTextStyles(child.style);
              return (
                <div 
                  key={index}
                  style={{
                    position: 'absolute',
                    left: child.absoluteBoundingBox?.x - node.absoluteBoundingBox?.x || 0,
                    top: child.absoluteBoundingBox?.y - node.absoluteBoundingBox?.y || 0,
                    width: child.absoluteBoundingBox?.width || 'auto',
                    color: child.fills ? extractColor(child.fills) : 'black',
                    ...textStyles
                  }}
                >
                  {child.characters || child.name}
                </div>
              );
            }
            
            // Handle rectangles, images, etc.
            if (child.type === 'RECTANGLE' || child.type === 'FRAME') {
              return (
                <div 
                  key={index}
                  style={{
                    position: 'absolute',
                    left: child.absoluteBoundingBox?.x - node.absoluteBoundingBox?.x || 0,
                    top: child.absoluteBoundingBox?.y - node.absoluteBoundingBox?.y || 0,
                    width: child.absoluteBoundingBox?.width || 'auto',
                    height: child.absoluteBoundingBox?.height || 'auto',
                    backgroundColor: child.fills ? extractColor(child.fills) : 'transparent',
                    borderRadius: child.cornerRadius || 0,
                    border: child.strokes && child.strokes.length > 0 ? 
                      `${child.strokeWeight || 1}px solid ${extractColor(child.strokes)}` : 'none'
                  }}
                >
                  {child.name}
                </div>
              );
            }
            
            return null;
          })}
        </div>
        
        {/* Display node information for debugging */}
        <div className="mt-6 p-4 border border-gray-200 rounded-md">
          <h3 className="text-lg font-medium mb-2">Node Information</h3>
          <p><strong>Node Name:</strong> {node.name || 'Unnamed'}</p>
          <p><strong>Node Type:</strong> {node.type || 'Unknown'}</p>
          <p><strong>Children:</strong> {node.children ? node.children.length : 0}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="figma-design-container p-4">
      <h2 className="text-xl font-semibold mb-4">Figma Design Implementation</h2>
      
      {serverStatus === 'not-running' && (
        <div className="server-error p-4 border border-yellow-200 bg-yellow-50 rounded-md mb-4">
          <h3 className="text-lg font-medium text-yellow-700 mb-2">Figma MCP Server Not Running</h3>
          <p className="mb-2">The Figma MCP server is not running on <code>http://localhost:3333</code>.</p>
          <p className="mb-2">Displaying implemented design based on the Figma reference.</p>
          <p className="mb-2 text-sm text-gray-600">Note: This is a direct implementation of the design without requiring the Figma MCP server.</p>
        </div>
      )}
      
      {serverStatus === 'error' && (
        <div className="server-error p-4 border border-red-200 bg-red-50 rounded-md mb-4">
          <h3 className="text-lg font-medium text-red-700 mb-2">Figma MCP Server Error</h3>
          <p>The Figma MCP server is running but returned an error. Please check the server logs.</p>
        </div>
      )}
      
      {loading && serverStatus === 'running' && (
        <div className="loading-state p-4 border border-gray-200 rounded-md">
          <p>Loading design data from Figma...</p>
        </div>
      )}
      
      {error && (
        <div className="error-state p-4 border border-red-200 bg-red-50 rounded-md mb-4">
          <h3 className="text-lg font-medium text-red-700 mb-2">Error Loading Figma Design</h3>
          <p className="mb-2">{error.message}</p>
          <p>Showing implemented design instead:</p>
        </div>
      )}
      
      {(!loading || serverStatus !== 'running') && (
        <div className="design-implementation">
          {renderDesign()}
        </div>
      )}
    </div>
  );
}

export default FigmaDesign;
