'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { Player } from '@/lib/types';
import { Copy, Crown, Loader2, User, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { disbandGame } from '@/app/actions';

interface GameLobbyProps {
  players: Player[];
  roomId: string;
  isHost: boolean;
  onStartGame: () => void;
}

export default function GameLobby({
  players,
  roomId,
  isHost,
  onStartGame,
}: GameLobbyProps) {
  const { toast } = useToast();
  const [isStarting, setIsStarting] = useState(false);

  const handleCopyLink = () => {
    const shareableLink = `${window.location.origin}/game/${roomId}`;
    navigator.clipboard.writeText(shareableLink);
    toast({
      title: 'Shareable Link Copied!',
      description: 'Send this link to your friends to join the game.',
    });
  };

  const handleStart = async () => {
    setIsStarting(true);
    try {
      await onStartGame();
    } catch (e) {
      toast({
        title: "Couldn't start game",
        variant: 'destructive',
      });
      setIsStarting(false);
    }
  };

  const handleDisband = async () => {
    try {
      await disbandGame(roomId);
      toast({
        title: 'Room Disbanded',
        description: 'The game room has been deleted.',
      });
    } catch (e) {
      toast({
        title: "Couldn't disband room",
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full animate-fade-in neon-glow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-headline text-3xl text-primary neon-text">
              Game Lobby
            </CardTitle>
            <CardDescription>
              Waiting for players to join...
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Share Link</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopyLink}
              className="mt-1 gap-2 font-mono text-xs neon-border"
            >
              <Copy className="h-4 w-4" />
              Copy Link
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="mb-4 text-lg font-semibold">Players ({players.length}/3)</h3>
        <div className="space-y-3">
          {players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary"
            >
              <div className="flex items-center gap-3">
                <User className="text-primary" />
                <span className="font-medium">{player.name}</span>
              </div>
              {player.isHost && (
                <div className="flex items-center gap-1 text-amber-400">
                  <Crown className="h-4 w-4" />
                  <span className="text-xs font-semibold">Host</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        {isHost ? (
          <>
            <Button
              onClick={handleStart}
              disabled={players.length < 1 || isStarting}
              className="w-full"
              size="lg"
            >
              {isStarting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isStarting ? 'Starting...' : 'Start Game'}
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Disband Room
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the game room and remove all players.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDisband}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, Disband Room
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : (
          <p className="text-center w-full text-muted-foreground">
            Waiting for the host to start the game...
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
