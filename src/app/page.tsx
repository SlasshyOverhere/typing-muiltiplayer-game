'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { createGame, joinGame } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PartyPopper, Swords, Users, Lock, Globe } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState<
    'create' | 'join' | 'matchmaking' | 'none'
  >('none');

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      toast({
        title: 'Enter Your Name',
        description: 'Please enter a name to create a game.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading('create');
    try {
      await createGame(playerName, isPrivate ? password : undefined);
      // redirect() will handle navigation
    } catch (error) {
      // Only show error if it's not a redirect
      if (error instanceof Error && !error.message.includes('NEXT_REDIRECT')) {
        toast({
          title: 'Error Creating Game',
          description: error.message,
          variant: 'destructive',
        });
        setIsLoading('none');
      }
    }
  };

  const handleMatchmaking = async () => {
    if (!playerName.trim()) {
      toast({
        title: 'Enter Your Name',
        description: 'Please enter a name to join matchmaking.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading('matchmaking');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/games/matchmaking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join matchmaking');
      }

      const data = await response.json();
      router.push(`/game/${data.roomId}?playerId=${data.playerId}`);
    } catch (error) {
      toast({
        title: 'Error Joining Matchmaking',
        description: error instanceof Error ? error.message : 'Failed to join matchmaking',
        variant: 'destructive',
      });
      setIsLoading('none');
    }
  };

  const handleJoinGame = async () => {
    if (!playerName.trim()) {
      toast({
        title: 'Enter Your Name',
        description: 'Please enter a name to join a game.',
        variant: 'destructive',
      });
      return;
    }
    if (!roomId.trim()) {
      toast({
        title: 'Enter Room Code',
        description: 'Please enter a 4-digit room code to join.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading('join');
    try {
      await joinGame(roomId, playerName, password);
      // redirect() will handle navigation
    } catch (error) {
      // Only show error if it's not a redirect
      if (error instanceof Error && !error.message.includes('NEXT_REDIRECT')) {
        toast({
          title: 'Error Joining Game',
          description: error.message,
          variant: 'destructive',
        });
        setIsLoading('none');
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(199,125,255,0.3),rgba(255,255,255,0))]"></div>
      <div className="text-center mb-8 z-10">
        <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter text-primary neon-text">
          Type Royale
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          The ultimate multiplayer typing challenge.
        </p>
      </div>
      <div className="w-full max-w-4xl z-10 space-y-6">
        {/* Player Name Input */}
        <Card className="neon-glow">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-lg font-semibold">Your Name</Label>
              <Input
                id="name"
                placeholder="SpeedyTyper"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="text-base h-12"
                maxLength={20}
              />
            </div>
          </CardContent>
        </Card>

        {/* Game Options */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Create Private Room */}
          <Card className="neon-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Create Private Room
              </CardTitle>
              <CardDescription>
                Create a password-protected room for friends
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="private-toggle"
                  checked={isPrivate}
                  onCheckedChange={setIsPrivate}
                />
                <Label htmlFor="private-toggle">Password Protected</Label>
              </div>
              {isPrivate && (
                <div className="space-y-2">
                  <Label htmlFor="password">Room Password</Label>
                  <Input
                    id="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="font-mono"
                    maxLength={20}
                  />
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleCreateGame}
                disabled={isLoading !== 'none'}
              >
                {isLoading === 'create' ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  <PartyPopper className="mr-2" />
                )}
                Create Room
              </Button>
            </CardFooter>
          </Card>

          {/* Join Room */}
          <Card className="neon-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Swords className="h-5 w-5 text-accent" />
                Join Room
              </CardTitle>
              <CardDescription>
                Enter a 4-digit room code to join
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="room-id">Room Code</Label>
                <Input
                  id="room-id"
                  placeholder="1234"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinGame()}
                  className="font-mono text-center text-2xl"
                  maxLength={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="join-password">Password (if required)</Label>
                <Input
                  id="join-password"
                  placeholder="Room password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="font-mono"
                  maxLength={20}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleJoinGame}
                disabled={isLoading !== 'none'}
              >
                {isLoading === 'join' ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  <Swords className="mr-2" />
                )}
                Join Room
              </Button>
            </CardFooter>
          </Card>

          {/* Random Matchmaking */}
          <Card className="neon-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-500" />
                Quick Match
              </CardTitle>
              <CardDescription>
                Join a public room or create one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <Users className="h-12 w-12 mx-auto text-green-500 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Find players instantly! Up to 20 players per room.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleMatchmaking}
                disabled={isLoading !== 'none'}
              >
                {isLoading === 'matchmaking' ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  <Users className="mr-2" />
                )}
                Quick Match
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
}