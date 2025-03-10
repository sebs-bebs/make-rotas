// Utility functions for interacting with Figma API through the MCP server

/**
 * Fetches a node from a Figma file using the Figma MCP server
 * @param {string} fileKey - The Figma file key
 * @param {string} nodeId - The ID of the node to fetch
 * @returns {Promise<Object>} - The node data from Figma
 */
export const fetchFigmaNode = async (fileKey, nodeId) => {
  try {
    console.log(`Attempting to fetch Figma node: fileKey=${fileKey}, nodeId=${nodeId}`);
    
    // The Figma MCP server is running on localhost:3333
    const response = await fetch(`http://localhost:3333/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tool: 'get_node',
        params: {
          fileKey,
          nodeId,
        },
      }),
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to fetch Figma node: ${response.statusText}. Status: ${response.status}. Details: ${errorText}`);
    }

    const data = await response.json();
    console.log('Figma data structure:', Object.keys(data));
    return data;
  } catch (error) {
    console.error('Error fetching Figma node:', error);
    throw error;
  }
};

/**
 * Fetches a Figma file using the Figma MCP server
 * @param {string} fileKey - The Figma file key
 * @param {number} depth - How many levels deep to traverse the node tree
 * @returns {Promise<Object>} - The file data from Figma
 */
export const fetchFigmaFile = async (fileKey, depth = 2) => {
  try {
    console.log(`Attempting to fetch Figma file: fileKey=${fileKey}, depth=${depth}`);
    
    // The Figma MCP server is running on localhost:3333
    const response = await fetch(`http://localhost:3333/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tool: 'get_file',
        params: {
          fileKey,
          depth,
        },
      }),
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to fetch Figma file: ${response.statusText}. Status: ${response.status}. Details: ${errorText}`);
    }

    const data = await response.json();
    console.log('Figma data structure:', Object.keys(data));
    return data;
  } catch (error) {
    console.error('Error fetching Figma file:', error);
    throw error;
  }
};
