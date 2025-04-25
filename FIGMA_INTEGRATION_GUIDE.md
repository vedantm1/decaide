# Connecting Replit to Figma for DecA(I)de Development

This guide explains how to integrate Figma designs with your DecA(I)de application in Replit, enabling a streamlined design-to-development workflow.

## Table of Contents

1. [Overview](#overview)
2. [Setting Up Figma Dev Mode](#setting-up-figma-dev-mode)
3. [Connecting with MCP Remote Server](#connecting-with-mcp-remote-server)
4. [Implementing Figma Components in React](#implementing-figma-components-in-react)
5. [Development Workflow](#development-workflow)
6. [Troubleshooting](#troubleshooting)

## Overview

Connecting Replit to Figma allows designers and developers to:

- View Figma designs directly within the Replit environment
- Extract design tokens, styles, and component properties
- Ensure design fidelity during implementation
- Streamline the handoff process between design and development

This integration uses Figma's Dev Mode and Message Control Protocol (MCP) to establish a connection between Figma and Replit.

## Setting Up Figma Dev Mode

### 1. Enable Dev Mode in Figma

1. Open your DecA(I)de design file in Figma
2. Click on the "Dev Mode" button in the top right corner
3. In Dev Mode, you can inspect components, styles, and export code

### 2. Generate a Figma Access Token

1. Go to your Figma account settings
2. Navigate to the "Personal Access Tokens" section
3. Create a new token with a descriptive name (e.g., "DecA(I)de Replit Integration")
4. Copy the generated token (you'll only see it once)

### 3. Get Your Figma File ID

1. Open your Figma design file
2. The file ID is in the URL: `https://www.figma.com/file/XXXXXXXXXX/`
3. Copy the ID (the XXXXXXXXXX part)

## Connecting with MCP Remote Server

The Message Control Protocol (MCP) allows communication between Figma and Replit. For this integration, you'll use a remote MCP server.

### 1. Install Required Packages

```bash
npm install mcp-remote figma-api-stub
```

### 2. Create a Figma Integration Script

Create a new file `figma-connect.js` in your project:

```javascript
const { spawn } = require('child_process');
const { writeFileSync } = require('fs');
const path = require('path');

// Environment variables for Figma connection
const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FIGMA_FILE_ID = process.env.FIGMA_FILE_ID;
const MCP_SERVER_URL = 'https://h2d-mcp.divriots.com/f467b14a-1737-48b1-a60f-7428ec595fae/sse';

// Validate environment variables
if (!FIGMA_ACCESS_TOKEN || !FIGMA_FILE_ID) {
  console.error('Error: FIGMA_ACCESS_TOKEN and FIGMA_FILE_ID environment variables are required');
  process.exit(1);
}

// Create a configuration file for the MCP connection
const configPath = path.join(__dirname, 'figma-config.json');
const config = {
  accessToken: FIGMA_ACCESS_TOKEN,
  fileId: FIGMA_FILE_ID,
  serverUrl: MCP_SERVER_URL
};

// Write the configuration to a file
writeFileSync(configPath, JSON.stringify(config, null, 2));

console.log('Starting Figma connection via MCP remote server...');

// Start the MCP remote connection
const mcpProcess = spawn('npx', ['mcp-remote', MCP_SERVER_URL], {
  env: {
    ...process.env,
    FIGMA_CONFIG_PATH: configPath
  },
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
```

### 3. Add Environment Variables to Replit

1. In your Replit project, go to the "Secrets" tab (lock icon)
2. Add the following environment variables:
   - `FIGMA_ACCESS_TOKEN`: Your Figma access token
   - `FIGMA_FILE_ID`: Your Figma file ID

### 4. Connect to the MCP Server

Run the connection script:

```bash
node figma-connect.js
```

Alternatively, you can connect directly using npx:

```bash
npx mcp-remote 'https://h2d-mcp.divriots.com/f467b14a-1737-48b1-a60f-7428ec595fae/sse'
```

This will establish a connection between Figma and your Replit project via the remote MCP server.

## Implementing Figma Components in React

### 1. Extract Design Tokens

Use Figma's design tokens feature to extract colors, typography, spacing, etc.:

```javascript
// client/src/styles/designTokens.js
export const colors = {
  primary: {
    DEFAULT: '#0ea5e9', // From Figma
    50: '#f0f9ff',
    // Other shades from Figma
  },
  // Other color definitions from Figma
};

export const typography = {
  fontFamily: {
    sans: ['Inter', 'sans-serif'], // From Figma
    display: ['Lexend', 'sans-serif'], // From Figma
  },
  // Other typography definitions from Figma
};

export const spacing = {
  // Spacing values from Figma
};
```

### 2. Create React Components Based on Figma Designs

Create React components that match your Figma components:

```jsx
// client/src/components/Button.jsx
import React from 'react';
import { cva } from 'class-variance-authority';

// This button styling is based on the Figma component
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary-600",
        secondary: "bg-secondary text-white hover:bg-secondary-600",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = ({ className, variant, size, ...props }) => {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  );
};

export default Button;
```

### 3. Use Figma Variables for Theming

If your Figma design uses variables, implement them in your theme:

```javascript
// client/src/styles/theme.js
import { colors, typography, spacing } from './designTokens';

const theme = {
  colors,
  typography,
  spacing,
  // Other theme properties from Figma
};

export default theme;
```

## Development Workflow

### 1. Start the Figma Connection

Start the MCP connection to Figma:

```bash
node figma-connect.js
```

### 2. Run Your Replit Application

In a separate terminal, start your application:

```bash
npm run dev
```

### 3. View Design Specs During Development

With the MCP connection active, you can:

- View component specs
- Check exact measurements
- Extract CSS properties
- Verify design fidelity

### 4. Implement Design Changes

As designers update the Figma file:

1. The changes are automatically synced via the MCP connection
2. You can immediately see and implement the updates
3. Maintain design consistency throughout development

## Troubleshooting

### Connection Issues

If you encounter issues connecting to the MCP server:

1. Verify your Figma access token is valid
2. Check that you have the correct file ID
3. Ensure the MCP server URL is correct
4. Try using a VPN if you're on a restricted network

### Permission Errors

If you see permission errors:

1. Verify you have access to the Figma file
2. Check that your access token has the appropriate permissions
3. Ask the Figma file owner to grant you Dev Mode access

### Package Installation Issues

If you have issues installing the required packages:

1. Check your Node.js version (should be 14 or higher)
2. Try clearing npm cache: `npm cache clean --force`
3. Use a specific version: `npm install mcp-remote@latest`

## Additional Resources

- [Figma Dev Mode Documentation](https://help.figma.com/hc/en-us/articles/15023124644247-Guide-to-Dev-Mode)
- [Figma API Documentation](https://www.figma.com/developers/api)
- [MCP Remote GitHub Repository](https://github.com/divriots/mcp-remote)

By following this guide, you'll establish a seamless connection between your Figma designs and Replit development environment, ensuring design fidelity and streamlining the development process for the DecA(I)de application.