import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import type { Player } from '@/lib/types';
import { randomUUID } from 'crypto';

// POST /api/games/[gameId]/join
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const game = await storage.getGame(gameId);

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Check password for private rooms
    const { playerName, password } = await request.json();
    
    if (game.password && game.password !== password) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    if (Object.keys(game.players).length >= game.maxPlayers) {
      return NextResponse.json({ error: 'Room is full' }, { status: 400 });
    }

    if (game.gameState !== 'waiting') {
      return NextResponse.json({ error: 'Game already started' }, { status: 400 });
    }

    if (!playerName) {
      return NextResponse.json({ error: 'Player name required' }, { status: 400 });
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
    await storage.setGame(gameId, game);

    return NextResponse.json({ playerId, game });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to join game' }, { status: 500 });
  }
}

