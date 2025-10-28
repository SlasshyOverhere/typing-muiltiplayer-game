'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { storage } from '@/lib/storage';
import type { Game, Player } from '@/lib/types';
import { randomUUID } from 'crypto';

const generateId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export async function createGame(playerName: string) {
  console.log('[CreateGame] Starting game creation for:', playerName);
  
  const playerId = randomUUID();
  const roomId = generateId();

  console.log('[CreateGame] Generated roomId:', roomId, 'playerId:', playerId);

  const newPlayer: Player = {
    id: playerId,
    name: playerName,
    isHost: true,
    progress: 0,
    wpm: 0,
    accuracy: 100,
    score: 0,
    finishTime: null,
  };

  const newGame: Game = {
    id: roomId,
    gameState: 'waiting',
    hostId: playerId,
    players: { [playerId]: newPlayer },
    textSnippet: 'The quick brown fox jumps over the lazy dog.',
    createdAt: new Date().toISOString(),
  };

  console.log('[CreateGame] Storing game:', roomId);
  storage.setGame(roomId, newGame);
  
  console.log('[CreateGame] Redirecting to:', `/game/${roomId}?playerId=${playerId}`);
  redirect(`/game/${roomId}?playerId=${playerId}`);
}

export async function joinGame(roomId: string, playerName: string) {
  const game = storage.getGame(roomId);

  if (!game) {
    throw new Error('Game not found.');
  }

  if (Object.keys(game.players).length >= 3) {
    throw new Error('This room is full.');
  }

  if (game.gameState !== 'waiting') {
    throw new Error('This game has already started.');
  }

  const playerId = randomUUID();
  
  const newPlayer: Player = {
    id: playerId,
    name: playerName,
    isHost: false,
    progress: 0,
    wpm: 0,
    accuracy: 100,
    score: 0,
    finishTime: null,
  };

  game.players[playerId] = newPlayer;
  storage.setGame(roomId, game);
  
  revalidatePath(`/game/${roomId}`);
  redirect(`/game/${roomId}?playerId=${playerId}`);
}

export async function joinGameClient(roomId: string, playerName: string): Promise<string> {
  console.log('[JoinGameClient] Attempting to join game:', roomId, 'with name:', playerName);
  
  const game = storage.getGame(roomId);

  if (!game) {
    throw new Error('Game not found.');
  }

  if (Object.keys(game.players).length >= 3) {
    throw new Error('This room is full.');
  }

  if (game.gameState !== 'waiting') {
    throw new Error('This game has already started.');
  }

  const playerId = randomUUID();
  
  const newPlayer: Player = {
    id: playerId,
    name: playerName,
    isHost: false,
    progress: 0,
    wpm: 0,
    accuracy: 100,
    score: 0,
    finishTime: null,
  };

  console.log('[JoinGameClient] Adding player:', playerId, 'to game:', roomId);
  
  game.players[playerId] = newPlayer;
  storage.setGame(roomId, game);
  
  console.log('[JoinGameClient] Player joined successfully');
  
  return playerId;
}

const TEXT_SNIPPETS = [
  'The quick brown fox jumps over the lazy dog.',
  'Pack my box with five dozen liquor jugs.',
  'How vexingly quick daft zebras jump!',
  'The five boxing wizards jump quickly.',
  'Sphinx of black quartz, judge my vow.',
  'Two driven jocks help fax my big quiz.',
  'Five quacking zephyrs jolt my wax bed.',
  'The job requires extra pluck and zeal from every young wage earner.',
  'A wizard\'s job is to vex chumps quickly in fog.',
  'The quick onyx goblin jumps over the lazy dwarf.',
];

export async function startGame(roomId: string) {
  const game = storage.getGame(roomId);

  if (!game) {
    throw new Error('Game not found');
  }

  // Pick a random text snippet
  const randomSnippet = TEXT_SNIPPETS[Math.floor(Math.random() * TEXT_SNIPPETS.length)];

  game.textSnippet = randomSnippet;
  game.gameState = 'countdown';
  game.startTime = new Date().toISOString();

  storage.setGame(roomId, game);

  // Auto-transition to playing after 4 seconds
  setTimeout(() => {
    const currentGame = storage.getGame(roomId);
    if (currentGame && currentGame.gameState === 'countdown') {
      currentGame.gameState = 'playing';
      currentGame.startTime = new Date().toISOString();
      storage.setGame(roomId, currentGame);
    }
  }, 4000);

  revalidatePath(`/game/${roomId}`);
}

export async function resetGame(roomId: string) {
  const game = storage.getGame(roomId);
  
  if (!game) {
    throw new Error('Game not found');
  }

  // Reset all players
  const resetPlayers = { ...game.players };
  for (const playerId in resetPlayers) {
    resetPlayers[playerId] = {
      ...resetPlayers[playerId],
      progress: 0,
      wpm: 0,
      accuracy: 100,
      score: 0,
      finishTime: null,
    };
  }

  game.players = resetPlayers;
  game.gameState = 'waiting';
  game.winnerId = undefined;
  game.rematchVotes = {};
  game.startTime = null;

  storage.setGame(roomId, game);
  
  revalidatePath(`/game/${roomId}`);
}

export async function disbandGame(roomId: string) {
  console.log('[DisbandGame] Disbanding game:', roomId);
  
  const game = storage.getGame(roomId);
  
  if (!game) {
    throw new Error('Game not found');
  }

  // Delete the game from storage
  storage.deleteGame(roomId);
  
  console.log('[DisbandGame] Game deleted:', roomId);
  
  // Redirect to homepage
  redirect('/');
}
