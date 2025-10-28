'use client';

import { Progress } from '@/components/ui/progress';
import type { Player } from '@/lib/types';
import { cn } from '@/lib/utils';
import { User, Trophy, Zap } from 'lucide-react';

interface PlayerProgressProps {
  player: Player;
  isLocalPlayer?: boolean;
  wpm?: number;
}

export default function PlayerProgress({
  player,
  isLocalPlayer = false,
  wpm,
}: PlayerProgressProps) {
  const barColor = isLocalPlayer ? 'bg-gradient-to-r from-primary to-primary/80' : 'bg-gradient-to-r from-accent to-accent/80';
  const isFinished = player.progress >= 100;
  const displayWpm = wpm ?? player.wpm;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2 text-sm">
        <span className={cn(
          "font-semibold flex items-center gap-2",
          isLocalPlayer && "text-primary",
          !isLocalPlayer && "text-accent"
        )}>
          <User className={cn("h-4 w-4", isLocalPlayer ? 'text-primary' : 'text-accent')} />
          <span className="min-w-[100px]">{player.name}</span>
          {isLocalPlayer && <span className="text-xs opacity-75">(You)</span>}
          {isFinished && <Trophy className="h-4 w-4 text-amber-400 animate-bounce" />}
          {!isFinished && displayWpm > 60 && <Zap className="h-3 w-3 text-yellow-400 animate-pulse" />}
        </span>
        <div className="flex items-center gap-3">
          <span className={cn(
            "font-mono text-sm font-bold min-w-[80px] text-right",
            isFinished && "text-accent",
            !isFinished && isLocalPlayer && "text-primary",
            !isFinished && !isLocalPlayer && "text-foreground"
          )}>
            {isFinished ? 'Finished!' : `${displayWpm} WPM`}
          </span>
          <span className={cn(
            "font-mono text-xs min-w-[45px] text-right",
            isLocalPlayer ? "text-primary/70" : "text-muted-foreground"
          )}>
            {Math.round(player.progress)}%
          </span>
        </div>
      </div>
      <div className="relative">
        <Progress 
          value={player.progress} 
          indicatorClassName={cn(
            barColor,
            isFinished && "animate-pulse",
            !isFinished && player.progress > 0 && "transition-all duration-300"
          )}
          className={cn(
            "h-3",
            isLocalPlayer && "border-2 border-primary/30"
          )}
        />
        {isFinished && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-background drop-shadow-md">
              ✓ DONE
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
