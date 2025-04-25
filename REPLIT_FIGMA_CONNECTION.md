# Connecting This Replit Project to Figma

This guide provides simple instructions to connect this specific Replit project to Figma using the Message Control Protocol (MCP).

## Quick Connection Steps

1. Open a new Replit shell/terminal window
2. Run the following command:

```bash
npx mcp-remote 'https://h2d-mcp.divriots.com/f467b14a-1737-48b1-a60f-7428ec595fae/sse'
```

3. Keep this terminal window running while you work

## What This Does

- Creates a connection between this Replit project and Figma
- Allows you to view and use Figma designs directly in this project
- Synchronizes design changes in real-time

## Troubleshooting

If the connection fails:

1. Make sure your Replit has internet access
2. Try restarting the Replit environment
3. Check if the MCP server is available

## Additional Notes

- This connection is temporary and will need to be reestablished if the Replit environment restarts
- The MCP connection must remain running for the integration to work
- You can open multiple terminal windows in Replit to keep the connection running while you work in other terminals