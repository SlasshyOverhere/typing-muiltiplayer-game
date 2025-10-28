import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import type { Game, Player } from '@/lib/types';
import { randomUUID } from 'crypto';

const generateId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// GET /api/games?id=ROOMID - Get game by ID
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const gameId = searchParams.get('id');

  if (!gameId) {
    return NextResponse.json({ error: 'Game ID required' }, { status: 400 });
  }

  const game = storage.getGame(gameId);

  if (!game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }

  return NextResponse.json(game);
}

// POST /api/games - Create new game
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerName } = body;

    if (!playerName) {
      return NextResponse.json({ error: 'Player name required' }, { status: 400 });
    }

    const playerId = randomUUID();
    const roomId = generateId();

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

    storage.setGame(roomId, newGame);

    return NextResponse.json({ roomId, playerId, game: newGame });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
  }
}

