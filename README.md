# Agar.io Bot Lobby

A comprehensive web application that allows you to fill agar.io lobbies with custom feeding bots that will help you dominate the game.

## Features

- **Bot Control Panel**: Configure nickname, server information, and bot count
- **Real-time Monitoring**: Live status updates for all active bots
- **Direct Server Connection**: Bots join your exact server without party mode
- **Feeding Mechanics**: Bots automatically feed mass to the main player
- **WebSocket Communication**: Real-time bot status updates
- **Dark/Light Mode**: Modern design system with theme switching
- **Responsive Design**: Works on desktop and mobile devices

## How to Use (No Party Mode Required!)

### Step 1: Join Any Server Normally
1. Open agar.io in your browser
2. Enter your nickname and join any server (don't use party mode)
3. Wait for the game to load

### Step 2: Get Server Information

**🎯 Easiest Method - Browser Extension:**
1. Install the included browser extension (see `/browser-extension` folder)
2. Join any agar.io game
3. Click extension icon in toolbar
4. Copy server IP:Port (e.g., `185.16.84.62:443`)

**🔍 Alternative Methods:**

**Method 1: Browser Developer Tools**
- Press F12 or Ctrl+Shift+I to open DevTools
- Go to "Network" tab
- Filter by "WS" (WebSocket)
- Look for connection to agar.io server
- Copy server IP from the URL column

**Method 2: Command Line**
- Open Command Prompt/Terminal
- Type: `netstat -an | findstr :443`
- Look for agar.io connections
- Copy foreign address IP

### Step 3: Configure Bots
1. **Enter Your Nickname**: This is your main player name in agar.io
2. **Enter Server IP**: Paste the server info (e.g., `185.16.84.62:443`)
3. **Configure Bot Count**: Choose how many bots to spawn (1-50)
4. **Enable Features**: Toggle auto-feed and auto-split options
5. **Start Bots**: Click "Start Bots" to begin the session

### Step 4: Monitor Bot Activity
- Watch real-time bot status in the monitoring panel
- See which bots are connecting, playing, or feeding
- Track individual bot mass and positions

## Supported Server Formats

- `agar.io/?ip=127.0.0.1:443` - Full URL with IP parameter
- `127.0.0.1:443` - Direct IP and port
- `agar.io` - Official servers (default region: EU-London)
- `ws://127.0.0.1:443` - WebSocket format

## Bot Behaviors

- **Connecting**: Bot is establishing connection to the game server
- **Playing**: Bot is actively playing and collecting food
- **Feeding**: Bot is feeding mass to the main player
- **Disconnected**: Bot has lost connection or been stopped

## Technical Architecture

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: API routes for bot management
- **Real-time Communication**: WebSocket service on port 3003
- **UI Components**: shadcn/ui component library
- **Design System**: OKLCH color space with dark/light themes

## Getting Started

The application consists of two main services:

1. **Main Application** (Port 3000): Web interface and API endpoints
2. **Bot Service** (Port 3003): WebSocket service for bot management

Both services start automatically when you run the development server.

## How It Works Without Party Mode

1. **Server Extraction**: The system extracts the server IP and port from your input
2. **Direct Connection**: Each bot connects directly to the same game server
3. **Region Matching**: Bots are routed to the same region as your game
4. **Real-time Sync**: All bots appear in your lobby simultaneously

## Notes

- This is a simulation/educational project demonstrating bot connectivity
- Bot behavior is simulated for demonstration purposes
- Real agar.io integration would require reverse engineering the game protocol
- Use responsibly and in accordance with game terms of service
- The system works with any agar.io server, not just official ones