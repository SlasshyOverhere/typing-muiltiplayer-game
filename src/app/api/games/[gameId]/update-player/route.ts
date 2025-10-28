import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

// PATCH /api/games/[gameId]/update-player
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const game = await storage.getGame(gameId);

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const { playerId, updates } = await request.json();

    if (!playerId || !game.players[playerId]) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Update player data
    game.players[playerId] = {
      ...game.players[playerId],
      ...updates,
    };

    await storage.setGame(gameId, game);

    return NextResponse.json(game);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update player' }, { status: 500 });
  }
}

