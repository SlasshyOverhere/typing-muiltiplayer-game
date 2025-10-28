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
import { createGame, joinGame } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PartyPopper, Swords } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isLoading, setIsLoading] = useState<
    'create' | 'join' | 'none'
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
      await createGame(playerName);
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
        title: 'Enter Room ID',
        description: 'Please enter a room ID to join.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading('join');
    try {
      await joinGame(roomId.toUpperCase(), playerName);
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
      <Card className="w-full max-w-md z-10 neon-glow animate-pulse-glow">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            Join the Arena
          </CardTitle>
          <CardDescription>
            Enter your name and create a new game or join an existing one.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              placeholder="SpeedyTyper"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateGame()}
              className="text-base"
              maxLength={20}
            />
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or join with
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="room-id">Room ID</Label>
            <Input
              id="room-id"
              placeholder="ABC123"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinGame()}
              className="uppercase font-mono"
              maxLength={6}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            className="w-full"
            onClick={handleCreateGame}
            disabled={isLoading !== 'none'}
          >
            {isLoading === 'create' ? (
              <Loader2 className="animate-spin" />
            ) : (
              <PartyPopper />
            )}
            Create Game
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleJoinGame}
            disabled={isLoading !== 'none'}
          >
            {isLoading === 'join' ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Swords />
            )}
            Join Game
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
