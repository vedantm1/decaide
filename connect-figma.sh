#!/bin/bash

# Script to connect this Replit project to Figma
echo "Starting Figma connection via MCP remote server..."
echo "Keep this terminal window open to maintain the connection."

# The MCP server URL from the Figma connection dialog
MCP_SERVER_URL="https://h2d-mcp.divriots.com/f467b14a-1737-48b1-a60f-7428ec595fae/sse"

# Run the MCP remote connection
npx mcp-remote "$MCP_SERVER_URL"