'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Swords } from 'lucide-react';

interface JoinGameDialogProps {
  isOpen: boolean;
  onJoin: (name: string) => Promise<void>;
  roomId: string;
}

export default function JoinGameDialog({
  isOpen,
  onJoin,
  roomId,
}: JoinGameDialogProps) {
  const [playerName, setPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      await onJoin(playerName.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join game');
      setIsJoining(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoin();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md neon-glow" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-primary flex items-center gap-2">
            <Swords className="h-6 w-6" />
            Join the Battle
          </DialogTitle>
          <DialogDescription>
            Enter your name to join room <span className="font-mono font-bold text-accent">{roomId}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="player-name">Your Name</Label>
            <Input
              id="player-name"
              placeholder="SpeedyTyper"
              value={playerName}
              onChange={(e) => {
                setPlayerName(e.target.value);
                setError('');
              }}
              onKeyPress={handleKeyPress}
              autoFocus
              disabled={isJoining}
              className="text-lg"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleJoin}
            disabled={isJoining || !playerName.trim()}
            className="w-full"
            size="lg"
          >
            {isJoining ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <Swords className="mr-2 h-4 w-4" />
                Join Game
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


