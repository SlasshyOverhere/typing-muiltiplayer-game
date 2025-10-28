const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (persists as long as server is running)
const games = new Map();

// Helper function to generate room ID
const generateRoomId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// Helper function to generate player ID
const generatePlayerId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Text snippets for the game
const TEXT_SNIPPETS = [
  'In the heart of a bustling city, where skyscrapers touched the clouds and streets hummed with endless activity, there lived a young programmer named Alex. Every morning, Alex would walk to their favorite coffee shop, order a double espresso, and settle into the corner booth with their laptop. The glow of the screen illuminated their face as they typed away, solving complex problems with elegant code. Their fingers danced across the keyboard, creating intricate algorithms that would eventually change the world. Despite the challenges and occasional bugs, Alex remained passionate about their craft, knowing that each line of code brought them closer to their ultimate goal of building something truly meaningful.',
  
  'The ancient library stood at the edge of the forest, its weathered stone walls covered in climbing ivy that had grown for centuries. Inside, countless books lined the shelves from floor to ceiling, their spines creating a rainbow of faded colors. The air smelled of old paper and leather bindings, mixed with the faint scent of candle wax. A young scholar named Maya spent her days here, carefully cataloging forgotten manuscripts and discovering lost knowledge. She would often lose track of time, becoming so absorbed in her research that the librarian would have to remind her when it was time to close. Among these dusty tomes, Maya found stories of ancient civilizations, forgotten languages, and mysteries that modern science had yet to explain.',
  
  'The mountain peak rose majestically above the clouds, its snow-capped summit glistening in the morning sun. A group of adventurous climbers had been ascending for three days, battling harsh winds and treacherous ice. Their leader, Sarah, checked the GPS coordinates and smiled with satisfaction. They were almost at the top. Each step required careful planning and unwavering focus. The thin air made breathing difficult, but their determination pushed them forward. As they finally reached the summit, the view took their breath away. Mountains stretched endlessly in all directions, their peaks piercing through the sea of clouds below. In that moment of triumph, they realized that the journey had taught them more about themselves than the destination ever could.',
  
  'The small coastal town woke up to the sound of seagulls and crashing waves. Fishermen prepared their boats for another day at sea, while local shop owners opened their stores along the cobblestone main street. Emma, a marine biologist, stood at the edge of the pier with her research equipment. She was studying the migration patterns of dolphins that frequented these waters. For months, she had been collecting data, photographing individuals, and tracking their movements. Today felt different though. The water was unusually calm, and she had a feeling something special was about to happen. Sure enough, as the sun climbed higher, a pod of dolphins appeared, leaping gracefully through the waves as if they were putting on a show just for her.',
  
  'Technology has revolutionized the way we communicate, work, and live our daily lives. From smartphones that fit in our pockets to artificial intelligence that can process information faster than any human brain, we are living in an unprecedented era of innovation. However, with these advancements come new challenges. Privacy concerns, digital addiction, and the widening gap between those who have access to technology and those who do not are issues that society must address. As we move forward into an increasingly digital future, it is crucial that we find a balance between embracing innovation and maintaining our humanity. The choices we make today will determine what kind of world we leave for future generations.',
  
  'Deep beneath the ocean surface, where sunlight cannot reach, exists a world of wonder and mystery. Bioluminescent creatures drift through the darkness, their bodies glowing with ethereal light. Giant squids hunt in the depths, their tentacles stretching out to capture prey. Underwater volcanoes spew mineral-rich water, creating unique ecosystems around their vents. Marine scientists in submersibles explore these alien landscapes, discovering new species with each expedition. The pressure at these depths would crush a human in seconds, yet life has found a way to thrive in these extreme conditions. Each discovery reveals how little we truly know about our own planet.',
  
  'The art of cooking is more than just following recipes and measuring ingredients. It is a form of creative expression that engages all the senses. A talented chef understands how flavors interact, how textures complement each other, and how presentation can turn a simple meal into an unforgettable experience. In a busy restaurant kitchen, chefs work in perfect harmony, each knowing their role in creating culinary masterpieces. The head chef, Carlos, orchestrates this beautiful chaos with precision and passion. He tastes every dish before it leaves the kitchen, making subtle adjustments to ensure perfection. For him, cooking is not just a job but a way of bringing joy to people through food.',
  
  'Space exploration has captured human imagination for generations. From the first satellites orbiting Earth to rovers exploring the surface of Mars, each mission has expanded our understanding of the universe. Astronauts train for years, preparing for the physical and mental challenges of space travel. They learn to work in zero gravity, operate complex equipment, and handle emergencies in an environment where help is millions of miles away. Despite the risks and difficulties, they are driven by curiosity and the desire to push the boundaries of human achievement. Their discoveries have led to technological innovations that benefit life on Earth, from improved weather forecasting to advanced medical imaging.',
];

// Clean up old games every hour
setInterval(() => {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  
  for (const [id, game] of games.entries()) {
    const createdAt = new Date(game.createdAt).getTime();
    if (now - createdAt > maxAge) {
      games.delete(id);
      console.log(`[Cleanup] Deleted old game: ${id}`);
    }
  }
}, 60 * 60 * 1000); // Run every hour

// ==================== API ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    gamesActive: games.size,
    uptime: process.uptime()
  });
});

// Get game by ID
app.get('/api/games/:gameId', (req, res) => {
  const { gameId } = req.params;
  const game = games.get(gameId);
  
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  
  res.json(game);
});

// Create new game
app.post('/api/games', (req, res) => {
  try {
    const { playerName } = req.body;
    
    if (!playerName) {
      return res.status(400).json({ error: 'Player name required' });
    }
    
    const playerId = generatePlayerId();
    const roomId = generateRoomId();
    
    const newPlayer = {
      id: playerId,
      name: playerName,
      isHost: true,
      progress: 0,
      wpm: 0,
      accuracy: 100,
      score: 0,
      finishTime: null,
    };
    
    const newGame = {
      id: roomId,
      gameState: 'waiting',
      hostId: playerId,
      players: { [playerId]: newPlayer },
      textSnippet: 'The quick brown fox jumps over the lazy dog.',
      createdAt: new Date().toISOString(),
    };
    
    games.set(roomId, newGame);
    console.log(`[Create] New game: ${roomId} by ${playerName}`);
    
    res.status(201).json({ roomId, playerId, game: newGame });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ error: 'Failed to create game' });
  }
});

// Join existing game
app.post('/api/games/:gameId/join', (req, res) => {
  try {
    const { gameId } = req.params;
    const { playerName } = req.body;
    
    const game = games.get(gameId);
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    if (Object.keys(game.players).length >= 3) {
      return res.status(400).json({ error: 'Room is full' });
    }
    
    if (game.gameState !== 'waiting') {
      return res.status(400).json({ error: 'Game already started' });
    }
    
    if (!playerName) {
      return res.status(400).json({ error: 'Player name required' });
    }
    
    const playerId = generatePlayerId();
    
    const newPlayer = {
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
    games.set(gameId, game);
    
    console.log(`[Join] ${playerName} joined game: ${gameId}`);
    
    res.json({ playerId, game });
  } catch (error) {
    console.error('Error joining game:', error);
    res.status(500).json({ error: 'Failed to join game' });
  }
});

// Start game
app.post('/api/games/:gameId/start', (req, res) => {
  try {
    const { gameId } = req.params;
    const game = games.get(gameId);
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    // Pick random text snippet
    const randomSnippet = TEXT_SNIPPETS[Math.floor(Math.random() * TEXT_SNIPPETS.length)];
    
    game.textSnippet = randomSnippet;
    game.gameState = 'countdown';
    game.startTime = new Date().toISOString();
    
    games.set(gameId, game);
    
    // Auto-transition to playing after 4 seconds
    setTimeout(() => {
      const currentGame = games.get(gameId);
      if (currentGame && currentGame.gameState === 'countdown') {
        currentGame.gameState = 'playing';
        currentGame.startTime = new Date().toISOString();
        games.set(gameId, currentGame);
        console.log(`[Start] Game started: ${gameId}`);
      }
    }, 4000);
    
    console.log(`[Countdown] Game countdown: ${gameId}`);
    
    res.json(game);
  } catch (error) {
    console.error('Error starting game:', error);
    res.status(500).json({ error: 'Failed to start game' });
  }
});

// Update game state
app.patch('/api/games/:gameId', (req, res) => {
  try {
    const { gameId } = req.params;
    const game = games.get(gameId);
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    const updates = req.body;
    
    // Merge updates
    const updatedGame = {
      ...game,
      ...updates,
      players: updates.players ? { ...game.players, ...updates.players } : game.players,
      rematchVotes: updates.rematchVotes !== undefined ? updates.rematchVotes : game.rematchVotes,
    };
    
    games.set(gameId, updatedGame);
    
    res.json(updatedGame);
  } catch (error) {
    console.error('Error updating game:', error);
    res.status(500).json({ error: 'Failed to update game' });
  }
});

// Update player in game
app.patch('/api/games/:gameId/update-player', (req, res) => {
  try {
    const { gameId } = req.params;
    const { playerId, updates } = req.body;
    
    const game = games.get(gameId);
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    if (!playerId || !game.players[playerId]) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    game.players[playerId] = {
      ...game.players[playerId],
      ...updates,
    };
    
    games.set(gameId, game);
    
    res.json(game);
  } catch (error) {
    console.error('Error updating player:', error);
    res.status(500).json({ error: 'Failed to update player' });
  }
});

// Reset game
app.post('/api/games/:gameId/reset', (req, res) => {
  try {
    const { gameId } = req.params;
    const game = games.get(gameId);
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
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
    
    games.set(gameId, game);
    
    console.log(`[Reset] Game reset: ${gameId}`);
    
    res.json(game);
  } catch (error) {
    console.error('Error resetting game:', error);
    res.status(500).json({ error: 'Failed to reset game' });
  }
});

// Delete game
app.delete('/api/games/:gameId', (req, res) => {
  const { gameId } = req.params;
  games.delete(gameId);
  console.log(`[Delete] Game deleted: ${gameId}`);
  res.json({ success: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Type Royale Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

