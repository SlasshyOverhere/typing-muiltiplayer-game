export type GameState = 'waiting' | 'countdown' | 'playing' | 'finished';

export type Player = {
  id: string;
  name: string;
  isHost: boolean;
  progress: number; // 0-100
  wpm: number;
  accuracy: number; // 0-100
  score: number;
  finishTime: number | null; // in seconds
  wantsRematch?: boolean; // For rematch voting
};

export type Game = {
  id: string;
  gameState: GameState;
  players: Record<string, Player>;
  textSnippet: string;
  hostId: string;
  createdAt: Date | string;
  winnerId?: string;
  startTime?: Date | string | null;
  rematchVotes?: Record<string, boolean>; // Track rematch votes
};
