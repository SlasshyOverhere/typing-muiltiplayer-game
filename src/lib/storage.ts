// Storage abstraction layer
// Automatically uses Vercel KV in production, in-memory for development

import type { Game } from './types';
import { kv } from '@vercel/kv';

// Check if we're in production with Vercel KV configured
const isProduction = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

// Fallback in-memory storage for development
const globalForGames = global as typeof global & {
  games: Map<string, Game>;
};
const memoryGames = globalForGames.games || new Map<string, Game>();
globalForGames.games = memoryGames;

// Key prefix for KV storage
const GAME_PREFIX = 'game:';
const GAME_TTL = 24 * 60 * 60; // 24 hours in seconds

export const storage = {
  // Get a game by ID
  getGame: async (gameId: string): Promise<Game | null> => {
    if (isProduction) {
      try {
        const game = await kv.get<Game>(`${GAME_PREFIX}${gameId}`);
        console.log('[Storage-KV] Getting game:', gameId, 'Found:', !!game);
        return game;
      } catch (error) {
        console.error('[Storage-KV] Error getting game:', error);
        return null;
      }
    } else {
      console.log('[Storage-Memory] Getting game:', gameId, 'Total games:', memoryGames.size);
      return memoryGames.get(gameId) || null;
    }
  },

  // Create or update a game
  setGame: async (gameId: string, game: Game): Promise<void> => {
    if (isProduction) {
      try {
        await kv.set(`${GAME_PREFIX}${gameId}`, game, { ex: GAME_TTL });
        console.log('[Storage-KV] Set game:', gameId);
      } catch (error) {
        console.error('[Storage-KV] Error setting game:', error);
        throw error;
      }
    } else {
      console.log('[Storage-Memory] Setting game:', gameId);
      memoryGames.set(gameId, game);
    }
  },

  // Delete a game
  deleteGame: async (gameId: string): Promise<void> => {
    if (isProduction) {
      try {
        await kv.del(`${GAME_PREFIX}${gameId}`);
        console.log('[Storage-KV] Deleted game:', gameId);
      } catch (error) {
        console.error('[Storage-KV] Error deleting game:', error);
        throw error;
      }
    } else {
      console.log('[Storage-Memory] Deleting game:', gameId);
      memoryGames.delete(gameId);
    }
  },

  // Check if game exists
  hasGame: async (gameId: string): Promise<boolean> => {
    if (isProduction) {
      try {
        const exists = await kv.exists(`${GAME_PREFIX}${gameId}`);
        return exists === 1;
      } catch (error) {
        console.error('[Storage-KV] Error checking game existence:', error);
        return false;
      }
    } else {
      return memoryGames.has(gameId);
    }
  },

  // Get all games (for debugging - use sparingly in production)
  getAllGames: async (): Promise<Game[]> => {
    if (isProduction) {
      try {
        const keys = await kv.keys(`${GAME_PREFIX}*`);
        const games: Game[] = [];
        for (const key of keys) {
          const game = await kv.get<Game>(key);
          if (game) games.push(game);
        }
        return games;
      } catch (error) {
        console.error('[Storage-KV] Error getting all games:', error);
        return [];
      }
    } else {
      return Array.from(memoryGames.values());
    }
  },

  // Clean up old games (KV auto-expires, this is for memory mode)
  cleanupOldGames: async (maxAgeMs: number = 24 * 60 * 60 * 1000): Promise<void> => {
    if (!isProduction) {
      const now = Date.now();
      for (const [id, game] of memoryGames.entries()) {
        const createdAt = game.createdAt instanceof Date 
          ? game.createdAt.getTime() 
          : new Date(game.createdAt).getTime();
        
        if (now - createdAt > maxAgeMs) {
          memoryGames.delete(id);
        }
      }
      console.log('[Storage-Memory] Cleanup complete. Games remaining:', memoryGames.size);
    }
    // KV games auto-expire, no cleanup needed
  }
};
