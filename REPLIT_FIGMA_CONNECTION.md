# Replit-Figma Connection Guide

This guide explains how to connect your Replit project with Figma, allowing for seamless design-to-code workflows.

## Prerequisites

- A Figma account with access to design files
- This Replit project
- MCP connection URL from Figma (obtained from the Figma Dev Mode connection dialog)

## Setup

1. We've already installed the `mcp-remote` package in this project, which allows communication between Replit and Figma.

2. Two connection scripts are provided:
   - `connect-figma.js` - JavaScript version
   - `connect-figma.sh` - Shell script version

## Connecting to Figma

### Using the JavaScript Script

Run the JS script with:

```bash
node connect-figma.js
```

### Using the Shell Script

Make the script executable first (only needed once):

```bash
chmod +x connect-figma.sh
```

Then run it:

```bash
./connect-figma.sh
```

## How It Works

1. When you run either script, it establishes a connection to the MCP (Message Control Protocol) server.
2. Keep the terminal window open to maintain the connection.
3. In Figma, open Dev Mode and use the connection dialog to link to this Replit project.
4. You can now receive design tokens, assets, and code snippets directly from Figma.

## Customizing the Connection

If you receive a different MCP URL from Figma, update it in both scripts:

- In `connect-figma.js`, modify the `MCP_SERVER_URL` variable
- In `connect-figma.sh`, modify the `MCP_SERVER_URL` variable

## Troubleshooting

- If the connection fails, ensure you're using the correct MCP URL from Figma
- Make sure the terminal running the connection script remains open
- Check that you have the necessary permissions in Figma