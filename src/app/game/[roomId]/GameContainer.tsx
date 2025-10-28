'use client';

import { useEffect, useState } from 'react';
import { useGame } from '@/hooks/use-game';
import GameLobby from '@/components/game/GameLobby';
import TypingGame from '@/components/game/TypingGame';
import GameResults from '@/components/game/GameResults';
import JoinGameDialog from '@/components/game/JoinGameDialog';
import { notFound, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { resetGame, startGame, joinGameClient } from '@/app/actions';
import { API_URL } from '@/lib/api-config';

export default function GameContainer({
  roomId,
  localPlayerId,
}: {
  roomId: string;
  localPlayerId: string | undefined;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { game, loading, error } = useGame(roomId);
  const [countdown, setCountdown] = useState(3);
  const [currentPlayerId, setCurrentPlayerId] = useState(localPlayerId);
  const [showJoinDialog, setShowJoinDialog] = useState(false);

  useEffect(() => {
    if (game?.gameState === 'countdown') {
      setCountdown(3); // Reset countdown when entering countdown state
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Auto-transition to playing state after countdown
      const transitionTimer = setTimeout(async () => {
        await fetch(`${API_URL}/api/games/${roomId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameState: 'playing',
            startTime: new Date().toISOString(),
          }),
        });
      }, 4000); // 3 seconds countdown + 1 second for "GO!"
      
      return () => {
        clearInterval(timer);
        clearTimeout(transitionTimer);
      };
    }
  }, [game?.gameState, roomId]);

  // Show join dialog if no player ID and game exists
  useEffect(() => {
    if (!currentPlayerId && game && !loading) {
      setShowJoinDialog(true);
    }
  }, [currentPlayerId, game, loading]);

  const handleJoinGame = async (playerName: string) => {
    const playerId = await joinGameClient(roomId, playerName);
    setCurrentPlayerId(playerId);
    setShowJoinDialog(false);
    // Update URL with playerId
    router.replace(`/game/${roomId}?playerId=${playerId}`);
  };
  
  if (!currentPlayerId && !loading) {
     return (
      <>
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-primary">Joining Game...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Enter your name to join this game room.</p>
          </CardContent>
        </Card>
        <JoinGameDialog
          isOpen={showJoinDialog}
          onJoin={handleJoinGame}
          roomId={roomId}
        />
      </>
    );
  }

  if (loading) {
    return (
      <Card className="w-full max-w-4xl animate-pulse">
        <CardContent className="p-6">
          <Skeleton className="h-8 w-1/4 mb-6" />
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-6 flex-1" />
            </div>
             <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-6 flex-1" />
            </div>
          </div>
          <Skeleton className="h-10 w-1/3 mt-8" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    notFound();
  }

  if (!game) return null;
  
  const handleStartGame = () => startGame(roomId);
  const handleResetGame = () => resetGame(roomId);

  const localPlayer = currentPlayerId ? game.players[currentPlayerId] : undefined;

  if (!localPlayer) {
    // This can happen if the player was kicked or the game was reset
     return (
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-destructive">You are not in this game</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You might have been disconnected. Please return to the homepage to join again.</p>
          <Button onClick={() => router.push('/')} className="mt-4">
            <Home className="mr-2 h-4 w-4" /> Go to Homepage
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl">
      {game.gameState === 'waiting' && (
        <GameLobby
          players={Object.values(game.players)}
          roomId={roomId}
          isHost={localPlayer.isHost}
          onStartGame={handleStartGame}
        />
      )}
      {(game.gameState === 'countdown' || game.gameState === 'playing') && currentPlayerId && (
        <TypingGame
          game={game}
          localPlayerId={currentPlayerId}
          countdown={countdown}
        />
      )}
      {game.gameState === 'finished' && currentPlayerId && (
        <GameResults
          players={Object.values(game.players)}
          winnerId={game.winnerId}
          localPlayerId={currentPlayerId}
          roomId={roomId}
          rematchVotes={game.rematchVotes}
          onPlayAgain={handleResetGame}
        />
      )}
    </div>
  );
}
