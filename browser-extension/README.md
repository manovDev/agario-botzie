# Agar.io Server Info Browser Extension

A simple browser extension that automatically detects and displays the current agar.io server IP and port for use with bot tools.

## Installation Instructions

### Chrome/Edge:
1. Download the extension files
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (top right toggle)
4. Click "Load unpacked"
5. Select the extension folder
6. Extension icon will appear in toolbar

### Firefox:
1. Download the extension files
2. Open Firefox and go to `about:debugging`
3. Click "Load Temporary Add-on"
4. Select the extension folder
5. Extension icon will appear in toolbar

## How to Use

1. **Join any agar.io game** (no party mode needed)
2. **Click the extension icon** in your browser toolbar
3. **Copy the server info** (IP:Port format)
4. **Paste into bot tool** - bots will join your exact server!

## Features

- **Automatic Detection**: Captures server info when you join games
- **Real-time Updates**: Shows current server connection
- **One-click Copy**: Copy server info with single click
- **Multiple Methods**: WebSocket, game variables, and network monitoring
- **Clean Interface**: Simple and easy to use

## Technical Details

The extension uses multiple methods to capture server information:

1. **WebSocket Interception**: Monitors WebSocket connections to agar.io servers
2. **Game Variables**: Extracts server info from game objects
3. **Network Monitoring**: Watches for server connection requests

## Privacy

- No data is sent to external servers
- All processing happens locally in your browser
- Only stores server info temporarily for popup display
- Minimal permissions required

## Troubleshooting

**No server detected?**
- Make sure you're actually in a game (not just on menu)
- Try refreshing the page and joining again
- Check if extension is enabled in browser

**Wrong server info?**
- Server IPs change each time you reconnect
- Always get fresh server info for new games
- Extension updates automatically when you join new servers

## Supported Formats

The extension provides server info in these formats:
- `185.16.84.62:443` (for bot tools)
- `ws://185.16.84.62:443` (WebSocket format)
- Individual IP and port values

This extension makes it easy to get the exact server information needed for bot tools to join your agar.io games!