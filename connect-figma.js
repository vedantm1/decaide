// Script to connect this Replit project to Figma
const { spawn } = require('child_process');

// The MCP server URL from the Figma connection dialog
const MCP_SERVER_URL = 'https://h2d-mcp.divriots.com/f467b14a-1737-48b1-a60f-7428ec595fae/sse';

console.log('Starting Figma connection via MCP remote server...');
console.log('Keep this terminal window open to maintain the connection.');

// Start the MCP remote connection
const mcpProcess = spawn('npx', ['mcp-remote', MCP_SERVER_URL], {
  stdio: 'inherit'
});

mcpProcess.on('close', (code) => {
  console.log(`MCP remote connection closed with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  mcpProcess.kill();
  process.exit();
});