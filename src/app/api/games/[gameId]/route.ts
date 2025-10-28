import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import type { Game } from '@/lib/types';

// GET /api/games/[gameId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params;
  const game = storage.getGame(gameId);

  if (!game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }

  return NextResponse.json(game);
}

// PATCH /api/games/[gameId] - Update game
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const game = storage.getGame(gameId);

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const updates = await request.json();

    // Merge updates with existing game
    const updatedGame: Game = {
      ...game,
      ...updates,
      // Handle nested player updates
      players: updates.players ? { ...game.players, ...updates.players } : game.players,
      rematchVotes: updates.rematchVotes !== undefined ? updates.rematchVotes : game.rematchVotes,
    };

    storage.setGame(gameId, updatedGame);

    return NextResponse.json(updatedGame);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update game' }, { status: 500 });
  }
}

// DELETE /api/games/[gameId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params;
  storage.deleteGame(gameId);
  return NextResponse.json({ success: true });
}

