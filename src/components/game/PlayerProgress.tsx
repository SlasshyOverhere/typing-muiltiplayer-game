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
  const isSurrendered = player.surrendered;
  const barColor = isSurrendered 
    ? 'bg-gradient-to-r from-orange-500 to-orange-600'
    : isLocalPlayer 
      ? 'bg-gradient-to-r from-primary to-primary/80' 
      : 'bg-gradient-to-r from-accent to-accent/80';
  const isFinished = player.progress >= 100;
  const displayWpm = wpm ?? player.wpm;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2 text-sm">
        <span className={cn(
          "font-semibold flex items-center gap-2",
          isSurrendered && "text-orange-500 line-through opacity-70",
          !isSurrendered && isLocalPlayer && "text-primary",
          !isSurrendered && !isLocalPlayer && "text-accent"
        )}>
          <User className={cn(
            "h-4 w-4", 
            isSurrendered ? 'text-orange-500' : isLocalPlayer ? 'text-primary' : 'text-accent'
          )} />
          <span className="min-w-[100px]">{player.name}</span>
          {isLocalPlayer && <span className="text-xs opacity-75">(You)</span>}
          {isSurrendered && <span className="text-xs text-orange-500">🏳️ Gave up</span>}
          {!isSurrendered && isFinished && <Trophy className="h-4 w-4 text-amber-400 animate-bounce" />}
          {!isSurrendered && !isFinished && displayWpm > 60 && <Zap className="h-3 w-3 text-yellow-400 animate-pulse" />}
        </span>
        <div className="flex items-center gap-3">
          <span className={cn(
            "font-mono text-sm font-bold min-w-[80px] text-right",
            isSurrendered && "text-orange-500",
            !isSurrendered && isFinished && "text-accent",
            !isSurrendered && !isFinished && isLocalPlayer && "text-primary",
            !isSurrendered && !isFinished && !isLocalPlayer && "text-foreground"
          )}>
            {isSurrendered ? 'Surrendered' : isFinished ? 'Finished!' : `${displayWpm} WPM`}
          </span>
          <span className={cn(
            "font-mono text-xs min-w-[45px] text-right",
            isSurrendered ? "text-orange-500/70" : isLocalPlayer ? "text-primary/70" : "text-muted-foreground"
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
            isLocalPlayer && "border-2 border-primary/30",
            isSurrendered && "opacity-50"
          )}
        />
        {isFinished && !isSurrendered && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-background drop-shadow-md">
              ✓ DONE
            </span>
          </div>
        )}
        {isSurrendered && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-white drop-shadow-md">
              🏳️ QUIT
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
