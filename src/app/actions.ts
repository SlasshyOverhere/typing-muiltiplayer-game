'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// Use backend URL from environment or localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function createGame(playerName: string) {
  console.log('[CreateGame] Starting game creation for:', playerName);
  
  try {
    const response = await fetch(`${API_URL}/api/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName }),
    });

    if (!response.ok) {
      throw new Error('Failed to create game');
    }

    const data = await response.json();
    console.log('[CreateGame] Game created:', data.roomId);
    
    redirect(`/game/${data.roomId}?playerId=${data.playerId}`);
  } catch (error) {
    console.error('[CreateGame] Error:', error);
    throw error;
  }
}

export async function joinGame(roomId: string, playerName: string) {
  try {
    const response = await fetch(`${API_URL}/api/games/${roomId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to join game');
    }

    const data = await response.json();
    
    revalidatePath(`/game/${roomId}`);
    redirect(`/game/${roomId}?playerId=${data.playerId}`);
  } catch (error) {
    console.error('[JoinGame] Error:', error);
    throw error;
  }
}

export async function joinGameClient(roomId: string, playerName: string): Promise<string> {
  console.log('[JoinGameClient] Attempting to join game:', roomId, 'with name:', playerName);
  
  try {
    const response = await fetch(`${API_URL}/api/games/${roomId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to join game');
    }

    const data = await response.json();
    console.log('[JoinGameClient] Player joined successfully');
    
    return data.playerId;
  } catch (error) {
    console.error('[JoinGameClient] Error:', error);
    throw error;
  }
}

export async function startGame(roomId: string) {
  try {
    const response = await fetch(`${API_URL}/api/games/${roomId}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to start game');
    }

    revalidatePath(`/game/${roomId}`);
  } catch (error) {
    console.error('[StartGame] Error:', error);
    throw error;
  }
}

export async function resetGame(roomId: string) {
  try {
    const response = await fetch(`${API_URL}/api/games/${roomId}/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to reset game');
    }

    revalidatePath(`/game/${roomId}`);
  } catch (error) {
    console.error('[ResetGame] Error:', error);
    throw error;
  }
}

export async function disbandGame(roomId: string) {
  console.log('[DisbandGame] Disbanding game:', roomId);
  
  try {
    const response = await fetch(`${API_URL}/api/games/${roomId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to disband game');
    }

    console.log('[DisbandGame] Game deleted:', roomId);
    
    // Redirect to homepage
    redirect('/');
  } catch (error) {
    console.error('[DisbandGame] Error:', error);
    throw error;
  }
}
