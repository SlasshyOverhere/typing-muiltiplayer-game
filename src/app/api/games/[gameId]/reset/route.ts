import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

// POST /api/games/[gameId]/reset
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const game = storage.getGame(gameId);

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
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

    storage.setGame(gameId, game);

    return NextResponse.json(game);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reset game' }, { status: 500 });
  }
}

