# Figma MCP Server Setup

## Overview
The Make Rotas application includes a Figma design integration that can fetch and display designs directly from Figma. This integration uses the Figma MCP (Model Context Protocol) server, which is an optional component that enables access to actual Figma design data.

## Important Note
**The Figma MCP server is optional.** The application will function without it by displaying a fallback design. This document is provided for developers who want to set up the server to access actual Figma designs.

## Setup Instructions

### Prerequisites
- Node.js (v20.17.0 or later)
- Access to the Figma-Context-MCP repository
- A valid Figma API key

### Installation Steps

1. **Clone the Figma-Context-MCP repository** (if not already done):
   ```
   git clone https://github.com/GLips/Figma-Context-MCP.git
   ```

2. **Build the Figma MCP server**:
   ```
   cd Figma-Context-MCP
   npm install
   npm run build
   ```

3. **Start the Figma MCP server**:
   ```
   npm run start:http
   ```
   
   Or using the CLI directly:
   ```
   node dist/cli.js --figma-api-key=YOUR_FIGMA_API_KEY
   ```

4. **Verify the server is running**:
   The server should be accessible at `http://localhost:3333`.
   
   You should see output similar to:
   ```
   HTTP server listening on port 3333
   SSE endpoint available at http://localhost:3333/sse
   Message endpoint available at http://localhost:3333/messages
   ```

## Configuration

### Figma API Key
To use the Figma MCP server, you need a valid Figma API key. You can obtain one from your Figma account settings.
```
YOUR_FIGMA_API_KEY_HERE
```

### File and Node Information
The current implementation uses:
- File Key: `YOUR_FIGMA_FILE_KEY`
- Node ID: `YOUR_NODE_ID`

You can modify these values in the `FigmaDesign.js` component to fetch different designs.

## Troubleshooting

### Server Not Running
If the server is not running, the application will display a yellow notification and show a fallback design. This is expected behavior and not an error.

### Connection Errors
If you encounter connection errors:
1. Verify the server is running on port 3333
2. Check that your Figma API key is valid
3. Ensure the file key and node ID are correct
4. Check the browser console for detailed error messages

## Development Without the Server
For most development work, you can proceed without the Figma MCP server. The application will display a fallback design that mimics the expected layout.

## Additional Resources
- [Figma API Documentation](https://www.figma.com/developers/api)
- [Figma MCP GitHub Repository](https://github.com/GLips/Figma-Context-MCP)
