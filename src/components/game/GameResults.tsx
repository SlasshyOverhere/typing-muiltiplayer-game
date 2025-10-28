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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Player } from '@/lib/types';
import { Crown, Loader2, PartyPopper, Check, X, Download } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import { API_URL } from '@/lib/api-config';

interface GameResultsProps {
  players: Player[];
  winnerId?: string;
  localPlayerId: string;
  roomId: string;
  rematchVotes?: Record<string, boolean>;
  onPlayAgain: () => void;
}

export default function GameResults({
  players,
  winnerId,
  localPlayerId,
  roomId,
  rematchVotes = {},
  onPlayAgain,
}: GameResultsProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const winner = players.find((p) => p.id === winnerId);
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  const totalPlayers = players.length;
  const votedPlayers = Object.values(rematchVotes).filter(Boolean).length;
  const localPlayerVoted = rematchVotes[localPlayerId] || false;

  useEffect(() => {
    setHasVoted(localPlayerVoted);
  }, [localPlayerVoted]);

  // Check if all players voted for rematch
  useEffect(() => {
    if (votedPlayers === totalPlayers && totalPlayers > 0 && votedPlayers > 0) {
      setIsResetting(true);
      onPlayAgain();
    }
  }, [votedPlayers, totalPlayers, onPlayAgain]);

  const handleVoteRematch = async (vote: boolean) => {
    if (hasVoted) return;
    
    const currentVotes = { ...rematchVotes, [localPlayerId]: vote };
    
    await fetch(`${API_URL}/api/games/${roomId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rematchVotes: currentVotes,
      }),
    });
    
    setHasVoted(true);
  };

  const handleLeave = () => {
    // Go to waiting room (homepage) for next match
    window.location.href = '/';
  };

  const handleSaveScreenshot = async () => {
    if (!cardRef.current) return;
    
    setIsDownloading(true);
    try {
      // Capture the card as a canvas with high quality settings
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0a0a0a', // Dark background
        scale: 3, // Very high quality (3x)
        logging: false,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true,
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight,
        scrollX: 0,
        scrollY: 0,
      });
      
      // Create a new canvas with watermark
      const finalCanvas = document.createElement('canvas');
      const ctx = finalCanvas.getContext('2d');
      
      // Set final canvas size (add space for watermark)
      finalCanvas.width = canvas.width + 40;
      finalCanvas.height = canvas.height + 80;
      
      // Fill with dark background
      ctx!.fillStyle = '#0a0a0a';
      ctx!.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
      
      // Draw the main content
      ctx!.drawImage(canvas, 20, 20);
      
      // Add watermark
      ctx!.fillStyle = '#8b5cf6'; // Purple color
      ctx!.font = 'bold 24px Arial';
      ctx!.textAlign = 'center';
      ctx!.fillText('Type Royale', finalCanvas.width / 2, finalCanvas.height - 20);
      
      // Add subtitle
      ctx!.fillStyle = '#a1a1aa';
      ctx!.font = '14px Arial';
      ctx!.fillText('Multiplayer Typing Challenge', finalCanvas.width / 2, finalCanvas.height - 5);
      
      // Convert to blob and download
      finalCanvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
          link.download = `type-royale-results-${timestamp}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          
          toast({
            title: 'Screenshot Saved!',
            description: 'Your game results have been downloaded as a high-quality PNG.',
          });
        }
      }, 'image/png', 1.0); // Maximum quality
    } catch (error) {
      console.error('Screenshot error:', error);
      toast({
        title: 'Screenshot Failed',
        description: 'Could not capture the screenshot. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card ref={cardRef} className="w-full text-center animate-fade-in neon-glow">
      <CardHeader>
        <div className="flex justify-end mb-2">
          <Button
            onClick={handleSaveScreenshot}
            variant="outline"
            size="sm"
            disabled={isDownloading}
            className="gap-2"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isDownloading ? 'Saving...' : 'Save Screenshot'}
          </Button>
        </div>
        <div className="flex flex-col items-center">
          <PartyPopper className="h-16 w-16 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
          <CardTitle className="font-headline text-4xl mt-4 neon-text">
            Game Over!
          </CardTitle>
              {winner ? (
                <CardDescription className="text-xl mt-2">
                  Winner is{' '}
                  <span className="font-bold text-accent">{winner.name}</span>!
                </CardDescription>
              ) : (
                <CardDescription className="text-xl mt-2">
                  {players.some(p => p.surrendered) && !players.some(p => !p.surrendered) 
                    ? "Everyone surrendered - No winner!" 
                    : "It's a draw!"}
                </CardDescription>
              )}
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="text-2xl font-semibold mb-4 font-headline neon-text">Final Scoreboard</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-primary/30">
                <TableHead className="text-center w-20">Rank</TableHead>
                <TableHead className="text-left">Player</TableHead>
                <TableHead className="text-center">WPM</TableHead>
                <TableHead className="text-center">Accuracy</TableHead>
                <TableHead className="text-center">Time</TableHead>
                <TableHead className="text-center">Final Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPlayers.map((player, index) => {
                const isWinner = player.id === winnerId;
                const isSurrendered = player.surrendered;
                const finishTimeDisplay = isSurrendered
                  ? '🏳️ Surrendered'
                  : player.finishTime 
                    ? `${player.finishTime.toFixed(1)}s`
                    : 'DNF';
                
                return (
                  <TableRow 
                    key={player.id}
                    className={cn(
                      "transition-colors hover:bg-muted/50",
                      isWinner && "bg-primary/10 border-l-4 border-l-primary",
                      isSurrendered && "opacity-60"
                    )}
                  >
                    <TableCell className="font-bold text-xl text-center">
                      {!isSurrendered && index === 0 && <Crown className="inline-block h-6 w-6 text-amber-400 mr-1 animate-pulse" />}
                      {!isSurrendered && index === 1 && <span className="text-slate-400 mr-1">🥈</span>}
                      {!isSurrendered && index === 2 && <span className="text-amber-600 mr-1">🥉</span>}
                      {index + 1}
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex flex-col">
                        <span className={cn(
                          "font-medium",
                          isWinner && "font-bold text-primary",
                          isSurrendered && "text-muted-foreground line-through"
                        )}>
                          {player.name}
                        </span>
                        {player.id === localPlayerId && (
                          <span className="text-xs text-muted-foreground">(You)</span>
                        )}
                        {isSurrendered && (
                          <span className="text-xs text-orange-500">Gave up</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className={cn(
                          "font-bold text-lg",
                          isSurrendered ? "text-muted-foreground" : "text-primary"
                        )}>
                          {player.wpm}
                        </span>
                        <span className="text-xs text-muted-foreground">words/min</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className={cn(
                          "font-bold text-lg",
                          isSurrendered ? "text-muted-foreground" : 
                          player.accuracy >= 95 ? "text-accent" : "text-foreground"
                        )}>
                          {player.accuracy}%
                        </span>
                        <span className="text-xs text-muted-foreground">accurate</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={cn(
                        "font-mono text-sm",
                        isSurrendered && "text-orange-500 font-semibold"
                      )}>
                        {finishTimeDisplay}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={cn(
                        "font-bold text-xl",
                        isSurrendered ? "text-muted-foreground" :
                        isWinner && "text-primary neon-text"
                      )}>
                        {Math.round(player.score)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-primary/20">
          <p className="text-sm text-center text-muted-foreground">
            <span className="font-semibold">Score Formula:</span> WPM × (Accuracy/100)² — Rewards both speed and accuracy!
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-4">
        {isResetting ? (
          <div className="text-center w-full">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground mt-2">Starting new game...</p>
          </div>
        ) : (
          <>
            <div className="w-full text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Rematch Votes: {votedPlayers}/{totalPlayers}
              </p>
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {players.map((player) => {
                  const voted = rematchVotes[player.id];
                  return (
                    <div
                      key={player.id}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-sm"
                    >
                      <span>{player.name}</span>
                      {voted === true && <Check className="h-4 w-4 text-accent" />}
                      {voted === false && <X className="h-4 w-4 text-destructive" />}
                      {voted === undefined && <span className="h-4 w-4 text-muted-foreground">?</span>}
                    </div>
                  );
                })}
              </div>
            </div>
            {!hasVoted ? (
              <div className="flex gap-2 w-full">
                <Button
                  onClick={() => handleVoteRematch(true)}
                  size="lg"
                  className="flex-1"
                >
                  <PartyPopper className="mr-2 h-4 w-4" />
                  Play Again
                </Button>
                <Button
                  onClick={handleLeave}
                  variant="secondary"
                  size="lg"
                  className="flex-1"
                >
                  <X className="mr-2 h-4 w-4" />
                  Leave
                </Button>
              </div>
            ) : (
              <div className="w-full text-center">
                <p className="text-muted-foreground mb-4">
                  {localPlayerVoted 
                    ? "Waiting for other players to vote..."
                    : "You&apos;ve declined the rematch."}
                </p>
                <Button
                  onClick={handleLeave}
                  variant="outline"
                  size="sm"
                >
                  <X className="mr-2 h-4 w-4" />
                  Leave to Waiting Room
                </Button>
              </div>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}
