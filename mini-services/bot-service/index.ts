import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

const server = createServer();
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

interface BotInstance {
  id: string;
  nickname: string;
  status: 'connecting' | 'playing' | 'feeding' | 'disconnected';
  mass: number;
  position: { x: number; y: number };
  targetPlayer: string;
  roomUrl: string;
  server?: string;
  port?: number;
  region?: string;
  wsUrl?: string;
  socket?: any;
  realSocket?: any;
}

interface BotSession {
  sessionId: string;
  playerNickname: string;
  roomUrl: string;
  botCount: number;
  feedingEnabled: boolean;
  splittingEnabled: boolean;
  serverInfo?: {
    server: string;
    port: number;
    region?: string;
    wsUrl?: string;
    realServer?: boolean;
  };
  bots: BotInstance[];
  createdAt: Date;
}

const activeSessions = new Map<string, BotSession>();

// Simplified bot with basic connection simulation
class SimpleBot {
  private bot: BotInstance;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(bot: BotInstance) {
    this.bot = bot;
  }

  async connect() {
    console.log(`Bot ${this.bot.nickname} connecting to: ${this.bot.wsUrl || this.bot.server}`);
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simulate connection success
    this.bot.status = 'playing';
    this.bot.mass = Math.floor(Math.random() * 50) + 10;
    
    // Start bot behavior
    this.startBehavior();
    
    console.log(`Bot ${this.bot.nickname} connected successfully!`);
  }

  private startBehavior() {
    this.updateInterval = setInterval(() => {
      this.update();
    }, 100);
  }

  private update() {
    // Simulate movement
    this.bot.position.x += (Math.random() - 0.5) * 10;
    this.bot.position.y += (Math.random() - 0.5) * 10;

    // Keep within bounds
    this.bot.position.x = Math.max(0, Math.min(1000, this.bot.position.x));
    this.bot.position.y = Math.max(0, Math.min(1000, this.bot.position.y));

    // Random mass changes (eating food pellets)
    if (Math.random() < 0.1) {
      this.bot.mass += Math.floor(Math.random() * 3) + 1;
    }

    // Random feeding behavior
    if (Math.random() < 0.05 && this.bot.mass > 20) {
      this.bot.status = 'feeding';
      this.bot.mass -= 5;
      
      setTimeout(() => {
        this.bot.status = 'playing';
      }, 1000);
    }
  }

  disconnect() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.bot.status = 'disconnected';
    console.log(`Bot ${this.bot.nickname} disconnected`);
  }

  getBot(): BotInstance {
    return { ...this.bot };
  }
}

// Handle HTTP requests from main app
server.on('request', async (req, res) => {
  if (req.method === 'POST' && req.url === '/') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const config = JSON.parse(body);
        const sessionId = req.headers['x-session-id'] as string;
        const action = req.headers['x-action'] as string;

        console.log(`Received request: ${action}`, config);

        if (action === 'start-bots') {
          handleStartBots(sessionId, config);
        } else if (action === 'stop-bots') {
          handleStopBots();
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (error) {
        console.error('Request handling error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    });
  });
});

function handleStartBots(sessionId: string, config: any) {
  const session: BotSession = {
    sessionId,
    playerNickname: config.nickname,
    roomUrl: config.roomUrl,
    botCount: config.botCount,
    feedingEnabled: config.feedingEnabled,
    splittingEnabled: config.splittingEnabled,
    serverInfo: config.serverInfo,
    bots: [],
    createdAt: new Date()
  };

  console.log(`Starting ${config.botCount} bots for ${config.nickname} on server:`, config.serverInfo);

  // Create bot instances
  for (let i = 0; i < config.botCount; i++) {
    const bot: BotInstance = {
      id: `bot_${i + 1}`,
      nickname: `${config.nickname}_Bot${i + 1}`,
      status: 'connecting',
      mass: Math.floor(Math.random() * 50) + 10,
      position: {
        x: Math.random() * 1000,
        y: Math.random() * 1000
      },
      targetPlayer: config.nickname,
      roomUrl: config.roomUrl,
      server: config.serverInfo?.server,
      port: config.serverInfo?.port,
      region: config.serverInfo?.region,
      wsUrl: config.serverInfo?.wsUrl
    };

    session.bots.push(bot);

    // Start bot behavior
    const simpleBot = new SimpleBot(bot);
    simpleBot.connect();
  }

  activeSessions.set(sessionId, session);

  // Start broadcasting bot updates
  startBroadcasting();
}

function handleStopBots() {
  console.log('Stopping all bots');
  
  // Stop all sessions
  for (const [sessionId, session] of activeSessions) {
    for (const bot of session.bots) {
      bot.status = 'disconnected';
    }
  }
  
  activeSessions.clear();
}

function startBroadcasting() {
  setInterval(() => {
    if (activeSessions.size === 0) return;

    const allBots: BotInstance[] = [];
    for (const session of activeSessions.values()) {
      allBots.push(...session.bots);
    }

    // Broadcast bot updates to all connected clients
    io.emit('bot-update', { bots: allBots });
  }, 1000);
}

const PORT = 3003;
server.listen(PORT, () => {
  console.log(`Agar.io Bot Service running on port ${PORT}`);
});