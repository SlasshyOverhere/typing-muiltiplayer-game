'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import type { Game, Player } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import PlayerProgress from './PlayerProgress';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Target, Crown, Trash2 } from 'lucide-react';
import { disbandGame } from '@/app/actions';
import { API_URL } from '@/lib/api-config';

interface TypingGameProps {
  game: Game;
  localPlayerId: string;
  countdown: number;
}

export default function TypingGame({
  game,
  localPlayerId,
  countdown,
}: TypingGameProps) {
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const { toast } = useToast();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isPlaying = game.gameState === 'playing' && countdown === 0;
  const isHost = game.players[localPlayerId]?.isHost || false;

  const handleDisband = async () => {
    try {
      const response = await fetch(`${API_URL}/api/games/${game.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to disband game');
      }

      toast({
        title: 'Room Disbanded Successfully!',
        description: 'All players have been sent back to the waiting room.',
        duration: 5000,
      });

      // Wait 3 seconds then redirect
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } catch (e) {
      toast({
        title: "Couldn't disband room",
        variant: 'destructive',
      });
    }
  };

  const handleSurrender = async () => {
    try {
      const response = await fetch(`${API_URL}/api/games/${game.id}/surrender`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: localPlayerId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to surrender');
      }
      
      toast({
        title: 'You Surrendered',
        description: 'Game ended. Showing results...',
      });
      
      // Force a page refresh to show results immediately
      window.location.reload();
    } catch (e) {
      toast({
        title: "Couldn't surrender",
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (isPlaying) {
      inputRef.current?.focus();
      setStartTime(new Date());
    }
  }, [isPlaying]);

  const characters = useMemo(
    () => game.textSnippet.split('').map((char, index) => {
        let state: 'correct' | 'incorrect' | 'untyped' = 'untyped';
        if (index < userInput.length) {
          state = char === userInput[index] ? 'correct' : 'incorrect';
        }
        return { char, state };
      }),
    [game.textSnippet, userInput]
  );

  const currentWpm = useMemo(() => {
    if (!startTime || userInput.length === 0) return 0;
    const timeElapsed = (new Date().getTime() - startTime.getTime()) / 1000 / 60;
    const wordsTyped = userInput.length / 5;
    return Math.round(wordsTyped / timeElapsed);
  }, [userInput, startTime]);

  const currentAccuracy = useMemo(() => {
    const correctChars = characters.filter((c, i) => i < userInput.length && c.state === 'correct').length;
    return userInput.length > 0 ? Math.round((correctChars / userInput.length) * 100) : 100;
  }, [characters, userInput]);
  
  const progress = (userInput.length / game.textSnippet.length) * 100;

  useEffect(() => {
    const updateProgress = async () => {
      if (game.gameState !== 'playing') return;
      
      // Update progress and WPM
      await fetch(`${API_URL}/api/games/${game.id}/update-player`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: localPlayerId,
          updates: {
            progress,
            wpm: currentWpm,
          },
        }),
      });

      if (userInput.length >= game.textSnippet.length) {
        const startTimeMs = game.startTime 
          ? (game.startTime instanceof Date ? game.startTime.getTime() : new Date(game.startTime).getTime())
          : new Date().getTime();
        const finishTime = (new Date().getTime() - startTimeMs) / 1000;
        
        const finalScore = currentWpm * (currentAccuracy / 100) ** 2;
        
        // Update this player's final stats
        await fetch(`${API_URL}/api/games/${game.id}/update-player`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId: localPlayerId,
            updates: {
              wpm: currentWpm,
              accuracy: currentAccuracy,
              progress: 100,
              finishTime,
              score: finalScore,
            },
          }),
        });

        // Fetch updated game to check if should end
        const gameResponse = await fetch(`${API_URL}/api/games/${game.id}`);
        const updatedGame: Game = await gameResponse.json();
        
        // Check finished players - use >= 99 to handle floating point precision
        const finishedPlayers = Object.values(updatedGame.players).filter(p => p.progress >= 99);
        const totalPlayers = Object.values(updatedGame.players).length;

        console.log('[TypingGame] Game end check:', { finishedPlayers: finishedPlayers.length, totalPlayers, shouldEnd: finishedPlayers.length === 1 || finishedPlayers.length === totalPlayers });

        // End game if this is the first to finish OR all players finished
        if (finishedPlayers.length === 1 || finishedPlayers.length === totalPlayers) {
          // Calculate winner based on highest score
          let winnerId = localPlayerId;
          let highScore = finalScore;
          
          Object.entries(updatedGame.players).forEach(([id, p]) => {
            if (p.score > highScore) {
              highScore = p.score;
              winnerId = id;
            }
          });

          console.log('[TypingGame] Ending game. Winner:', winnerId, 'Score:', highScore);

          await fetch(`${API_URL}/api/games/${game.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              gameState: 'finished',
              winnerId,
            }),
          });
        }
      }
    };
    
    const debounceTimeout = setTimeout(updateProgress, 250);
    return () => clearTimeout(debounceTimeout);

  }, [progress, currentWpm, game.id, localPlayerId, game.gameState, userInput.length, game.textSnippet.length, toast, currentAccuracy, game.startTime, game.players]);

  if (game.gameState === 'countdown' && countdown > 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-9xl font-bold text-primary animate-ping neon-text">
          {countdown}
        </p>
      </div>
    );
  }
   if (game.gameState === 'countdown' && countdown === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-9xl font-bold text-accent animate-pulse neon-text-accent">
          GO!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Live Progress Bars - Above the typing area */}
      <Card className="w-full neon-glow">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Live Race Progress
            </h3>
            {isHost && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Disband
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Disband this game?</AlertDialogTitle>
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
                      Yes, Disband
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          <div className="space-y-3">
            {Object.values(game.players)
              .filter(player => !player.surrendered) // Only show active players
              .sort((a, b) => b.progress - a.progress) // Sort by progress (leader first)
              .map((player, index) => (
                <div key={player.id} className="space-y-1">
                  <PlayerProgress 
                    player={player} 
                    isLocalPlayer={player.id === localPlayerId}
                    wpm={player.id === localPlayerId ? currentWpm : player.wpm}
                  />
                  {index === 0 && player.progress > 0 && player.progress < 100 && (
                    <p className="text-xs text-amber-400 flex items-center gap-1 ml-6 animate-pulse">
                      <Crown className="h-3 w-3" /> Leading!
                    </p>
                  )}
                </div>
              ))}
            
            {/* Show surrendered players separately */}
            {Object.values(game.players).some(p => p.surrendered) && (
              <div className="mt-4 pt-3 border-t border-muted">
                <p className="text-xs text-muted-foreground mb-2">Surrendered:</p>
                {Object.values(game.players)
                  .filter(player => player.surrendered)
                  .map((player) => (
                    <div key={player.id} className="flex items-center gap-2 text-sm text-orange-500 opacity-70">
                      <span>🏳️</span>
                      <span className="line-through">{player.name}</span>
                      <span className="text-xs">(Gave up)</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Typing Area */}
      <Card className="w-full neon-glow">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className='flex gap-6 text-center'>
            <div>
              <div className="text-sm text-muted-foreground">Your WPM</div>
              <div className="text-3xl font-bold text-primary neon-text">{currentWpm}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
              <div className="text-3xl font-bold text-accent neon-text-accent">{currentAccuracy}%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Progress</div>
              <div className="text-3xl font-bold text-foreground">{Math.round(progress)}%</div>
            </div>
          </div>
          
          {/* Surrender Button */}
          {!game.players[localPlayerId]?.surrendered && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-orange-500 border-orange-500 hover:bg-orange-500/10 hover:text-orange-400"
                >
                  🏳️ Surrender
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Give up?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to surrender? You will not receive any score,
                    and the game will end if you&apos;re the last active player.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Fighting!</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSurrender}
                    className="bg-orange-500 text-white hover:bg-orange-600"
                  >
                    Yes, Surrender
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardHeader>
      <CardContent className="relative min-h-[300px]" onClick={() => inputRef.current?.focus()}>
        <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          <div
            className="text-xl leading-relaxed font-mono tracking-wide text-muted-foreground relative select-none break-words"
            aria-hidden="true"
          >
            {characters.map(({ char, state }, index) => (
              <span
                key={index}
                className={cn({
                  'text-foreground': state === 'correct',
                  'text-destructive bg-destructive/10': state === 'incorrect',
                  'border-b-2 border-primary animate-pulse bg-primary/5': index === userInput.length
                })}
              >
                {char}
              </span>
            ))}
          </div>
        </div>
        <textarea
          ref={inputRef}
          value={userInput}
          onChange={(e) => isPlaying && setUserInput(e.target.value)}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-default resize-none"
          autoFocus
          disabled={!isPlaying}
        />
      </CardContent>
      </Card>
    </div>
  );
}
