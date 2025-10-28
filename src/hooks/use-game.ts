'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Game } from '@/lib/types';
import { useToast } from './use-toast';

export function useGame(roomId: string) {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchGame = useCallback(async () => {
    if (!roomId) return;

    try {
      const response = await fetch(`/api/games/${roomId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Game not found.');
          setGame(null);
        } else {
          throw new Error('Failed to fetch game');
        }
        setLoading(false);
        return;
      }

      const gameData: Game = await response.json();
      setGame(gameData);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to connect to the game.');
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchGame();

    // Poll for updates every 500ms for real-time feel
    const interval = setInterval(fetchGame, 500);

    return () => clearInterval(interval);
  }, [fetchGame]);

  return { game, loading, error, refetch: fetchGame };
}
