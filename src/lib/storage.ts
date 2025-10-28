// In-memory storage for game state
// Note: This resets on server restart. For production, use Vercel KV or a database

import type { Game } from './types';

// Use global to ensure the Map persists across hot reloads in development
const globalForGames = global as typeof global & {
  games: Map<string, Game>;
};

// Store games in memory
const games = globalForGames.games || new Map<string, Game>();
globalForGames.games = games;

export const storage = {
  // Get a game by ID
  getGame: (gameId: string): Game | null => {
    console.log('[Storage] Getting game:', gameId, 'Total games:', games.size, 'All game IDs:', Array.from(games.keys()));
    return games.get(gameId) || null;
  },

  // Create or update a game
  setGame: (gameId: string, game: Game): void => {
    console.log('[Storage] Setting game:', gameId);
    games.set(gameId, game);
    console.log('[Storage] After set - Total games:', games.size, 'All game IDs:', Array.from(games.keys()));
  },

  // Delete a game
  deleteGame: (gameId: string): void => {
    games.delete(gameId);
  },

  // Check if game exists
  hasGame: (gameId: string): boolean => {
    return games.has(gameId);
  },

  // Get all games (for debugging)
  getAllGames: () => {
    return Array.from(games.values());
  },

  // Clean up old games (optional, run periodically)
  cleanupOldGames: (maxAgeMs: number = 24 * 60 * 60 * 1000) => {
    const now = Date.now();
    for (const [id, game] of games.entries()) {
      const createdAt = game.createdAt instanceof Date 
        ? game.createdAt.getTime() 
        : new Date(game.createdAt).getTime();
      
      if (now - createdAt > maxAgeMs) {
        games.delete(id);
      }
    }
  }
};

