'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Bot, Play, Square, Users, Gamepad2, Link, User, Wifi, WifiOff, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

interface BotStatus {
  id: string;
  nickname: string;
  status: 'connecting' | 'playing' | 'feeding' | 'disconnected';
  mass: number;
  position: { x: number; y: number };
}

export default function Home() {
  const [nickname, setNickname] = useState('');
  const [roomUrl, setRoomUrl] = useState('');
  const [botCount, setBotCount] = useState(10);
  const [isRunning, setIsRunning] = useState(false);
  const [bots, setBots] = useState<BotStatus[]>([]);
  const [feedingEnabled, setFeedingEnabled] = useState(true);
  const [splittingEnabled, setSplittingEnabled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize WebSocket connection only on client
  useEffect(() => {
    if (!mounted) return;
    
    try {
      const newSocket = io('/?XTransformPort=3003');
      
      newSocket.on('connect', () => {
        console.log('Connected to bot service');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from bot service');
        setIsConnected(false);
      });

      newSocket.on('bot-update', (data: { bots: BotStatus[] }) => {
        setBots(data.bots);
      });

      return () => {
        newSocket.close();
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }, [mounted]);

  const startBots = async () => {
    if (!nickname || !roomUrl) {
      alert('Please enter both nickname and server URL');
      return;
    }

    setIsRunning(true);
    
    try {
      const response = await fetch('/api/bots/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname,
          roomUrl,
          botCount,
          feedingEnabled,
          splittingEnabled
        })
      });

      if (response.ok) {
        const data = await response.json();
        setBots(data.bots);
      }
    } catch (error) {
      console.error('Failed to start bots:', error);
      setIsRunning(false);
    }
  };

  const stopBots = async () => {
    setIsRunning(false);
    
    try {
      await fetch('/api/bots/stop', { method: 'POST' });
      setBots([]);
    } catch (error) {
      console.error('Failed to stop bots:', error);
    }
  };

  const getStatusColor = (status: BotStatus['status']) => {
    switch (status) {
      case 'playing': return 'bg-chart-1';
      case 'feeding': return 'bg-chart-2';
      case 'connecting': return 'bg-chart-3';
      case 'disconnected': return 'bg-chart-5';
      default: return 'bg-muted';
    }
  };

  const activeBots = bots.filter(bot => bot.status !== 'disconnected').length;
  const feedingBots = bots.filter(bot => bot.status === 'feeding').length;

  // Don't render interactive parts until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background text-foreground p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Gamepad2 className="w-10 h-10 text-primary" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Agar.io Bot Lobby
              </h1>
            </div>
            <p className="text-muted-foreground">Fill agar.io lobbies with custom feeding bots</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Gamepad2 className="w-10 h-10 text-primary" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Agar.io Bot Lobby
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <><Wifi className="w-5 h-5 text-chart-1" /><span className="text-chart-1 text-sm">Connected</span></>
                ) : (
                  <><WifiOff className="w-5 h-5 text-destructive" /><span className="text-destructive text-sm">Disconnected</span></>
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-10 w-10"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground">Fill agar.io lobbies with custom feeding bots</p>
          
          <Card className="bg-muted/50 border-border">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-2">🔍 How to Find Server IP:</h3>
              
              <div className="space-y-3">
                <div className="bg-background p-3 rounded border border-border">
                  <h4 className="font-medium text-xs mb-1 text-primary">Method 1: Browser Developer Tools (Easiest)</h4>
                  <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Press F12 or Ctrl+Shift+I to open DevTools</li>
                    <li>Go to "Network" tab</li>
                    <li>Filter by "WS" (WebSocket)</li>
                    <li>Look for connection to agar.io server</li>
                    <li>Copy the full WebSocket URL</li>
                  </ol>
                  <p className="text-xs mt-1 text-chart-1">Format: `wss://web-arenas-live-v25-0.agario.miniclippt.com/websocket`</p>
                </div>

                <div className="bg-background p-3 rounded border border-border">
                  <h4 className="font-medium text-xs mb-1 text-primary">Method 2: Browser Extension (Recommended)</h4>
                  <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Install "agar.io server info" extension</li>
                    <li>Join any agar.io game</li>
                    <li>Server URL appears in extension popup</li>
                    <li>Copy and paste the full WebSocket URL</li>
                  </ol>
                  <p className="text-xs mt-1 text-chart-2">Extension shows real server URL automatically</p>
                </div>

                <div className="bg-background p-3 rounded border border-border">
                  <h4 className="font-medium text-xs mb-1 text-primary">Method 3: Command Line (Advanced)</h4>
                  <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Open Command Prompt/Terminal</li>
                    <li>Type: <code className="bg-muted px-1 rounded">netstat -an | findstr :443</code></li>
                    <li>Look for agar.io connections</li>
                    <li>Copy the full server URL</li>
                  </ol>
                  <p className="text-xs mt-1 text-chart-3">Shows active network connections</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs font-medium mb-1">🔥 Real Bot Connections Active!</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Bots connect to REAL agar.io servers</li>
                  <li>Using actual WebSocket protocol</li>
                  <li>Multiple connection attempts with fallbacks</li>
                  <li>Enhanced error handling and logging</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Control Panel */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                Bot Control Panel
              </CardTitle>
              <CardDescription>Configure and manage your agar.io bots</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nickname" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Your Nickname
                  </Label>
                  <Input
                    id="nickname"
                    placeholder="Enter your agar.io nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    disabled={isRunning}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roomUrl" className="flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    WebSocket Server URL
                  </Label>
                  <Input
                    id="roomUrl"
                    placeholder="wss://web-arenas-live-v25-0.agario.miniclippt.com/websocket"
                    value={roomUrl}
                    onChange={(e) => setRoomUrl(e.target.value)}
                    disabled={isRunning}
                  />
                  <p className="text-xs text-muted-foreground">
                    🔍 Get the full WebSocket URL from browser extension
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="botCount">Number of Bots: {botCount}</Label>
                  <Input
                    id="botCount"
                    type="range"
                    min="1"
                    max="50"
                    value={botCount}
                    onChange={(e) => setBotCount(Number(e.target.value))}
                    className="w-full"
                    disabled={isRunning}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="feeding">Auto Feed</Label>
                  <Switch
                    id="feeding"
                    checked={feedingEnabled}
                    onCheckedChange={setFeedingEnabled}
                    disabled={isRunning}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="splitting">Auto Split</Label>
                  <Switch
                    id="splitting"
                    checked={splittingEnabled}
                    onCheckedChange={setSplittingEnabled}
                    disabled={isRunning}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={startBots}
                  disabled={isRunning || !nickname || !roomUrl}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Bots
                </Button>
                <Button
                  onClick={stopBots}
                  disabled={!isRunning}
                  variant="destructive"
                  className="flex-1"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop Bots
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Status Panel */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Bot Status
              </CardTitle>
              <CardDescription>Real-time bot activity monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="bots">Individual Bots</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="text-2xl font-bold text-chart-1">{activeBots}</div>
                      <div className="text-sm text-muted-foreground">Active Bots</div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="text-2xl font-bold text-chart-2">{feedingBots}</div>
                      <div className="text-sm text-muted-foreground">Feeding Bots</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Connection Status</span>
                      <span>{isRunning ? 'Connected' : 'Disconnected'}</span>
                    </div>
                    <Progress 
                      value={isRunning ? 100 : 0} 
                      className="h-2"
                    />
                  </div>

                  <div className="bg-muted p-3 rounded-lg">
                    <div className="text-sm font-medium mb-2">Bot Distribution</div>
                    <div className="space-y-2">
                      {['playing', 'feeding', 'connecting', 'disconnected'].map((status) => {
                        const count = bots.filter(bot => bot.status === status).length;
                        const percentage = bots.length > 0 ? (count / bots.length) * 100 : 0;
                        return (
                          <div key={status} className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(status as BotStatus['status'])}`} />
                            <span className="text-sm capitalize flex-1">{status}</span>
                            <span className="text-sm text-muted-foreground">{count}</span>
                            <div className="w-20 bg-border rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${getStatusColor(status as BotStatus['status'])}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="bots" className="space-y-2">
                  <div className="max-h-80 overflow-y-auto space-y-2">
                    {bots.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        No bots active. Start bots to see their status.
                      </div>
                    ) : (
                      bots.map((bot) => (
                        <div key={bot.id} className="bg-muted p-3 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(bot.status)}`} />
                            <div>
                              <div className="font-medium">{bot.nickname}</div>
                              <div className="text-xs text-muted-foreground capitalize">{bot.status}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{bot.mass}</div>
                            <div className="text-xs text-muted-foreground">mass</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}