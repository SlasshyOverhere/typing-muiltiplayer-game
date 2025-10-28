# Type Royale ⌨️🏆

A competitive multiplayer typing speed game for up to 3 friends, featuring real-time gameplay and vibrant neon theme. **100% serverless** - runs entirely on Vercel with zero external dependencies!

![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-black?style=for-the-badge&logo=vercel)

## ✨ Features

- 🎯 **Multiplayer Racing** - Compete with up to 3 players in real-time
- 🔗 **Shareable Links** - Create a room and share the link with friends
- 📊 **Live Stats** - Real-time WPM, accuracy, and progress indicators
- 🏆 **Smart Scoring** - Advanced algorithm combining WPM and accuracy
- 🔄 **Rematch System** - All players vote to start a new round
- 🎨 **Neon Theme** - Vibrant purple and green dark mode aesthetics
- ⚡ **100% Serverless** - No Firebase, no database, just Vercel!
- 🚀 **Zero Config** - Deploy instantly, no setup required

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd typing_game_g-firebase
npm install
```

### 2. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - that's it! 🎉

### 3. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click the button above or go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Click "Deploy"
4. Done! Your game is live 🚀

**No environment variables needed!** Everything works out of the box.

## 🎮 How to Play

### Creating a Game

1. Enter your name on the homepage
2. Click **"Create Game"**
3. Copy and share the room link with friends
4. Wait for players to join (max 3 players)
5. Click **"Start Game"** when ready

### Joining a Game

**Method 1: Via Link (Recommended)**
- Click on a shared room link
- Enter your name in the popup
- Join automatically!

**Method 2: Via Room ID**
- Enter your name on the homepage
- Enter the 6-character room ID
- Click **"Join Game"**

### Playing

- Type the displayed text as fast and accurately as possible
- Watch real-time progress bars to see who's ahead
- First to finish with the best score wins!

### Scoring Algorithm

```
Score = WPM × (Accuracy / 100)²
```

This rewards both speed and accuracy, with accuracy weighted more heavily.

**Examples:**
- 60 WPM @ 100% accuracy = **60 points**
- 80 WPM @ 95% accuracy = **72.2 points**
- 100 WPM @ 85% accuracy = **72.25 points**

### Rematch

- After the game ends, all players can vote for a rematch
- Click **"Play Again"** to vote yes, or **"Leave"** to vote no
- If ALL players vote yes, a new round starts automatically
- Voting no or leaving ends your participation

## 🏗️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Storage**: In-memory (serverless functions)
- **Hosting**: Vercel
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── app/
│   ├── api/                  # API routes for game management
│   │   └── games/
│   │       ├── route.ts             # Create/get games
│   │       └── [gameId]/
│   │           ├── route.ts         # Get/update/delete game
│   │           ├── join/route.ts    # Join game
│   │           ├── start/route.ts   # Start game
│   │           ├── reset/route.ts   # Reset game
│   │           └── update-player/   # Update player stats
│   ├── page.tsx              # Homepage
│   └── game/[roomId]/        # Game room pages
├── components/
│   ├── game/
│   │   ├── GameLobby.tsx     # Waiting room
│   │   ├── TypingGame.tsx    # Main game component
│   │   ├── GameResults.tsx   # Results & rematch
│   │   ├── PlayerProgress.tsx # Progress bars
│   │   └── JoinGameDialog.tsx # Name entry dialog
│   └── ui/                   # shadcn/ui components
├── hooks/
│   ├── use-game.ts           # Game state polling
│   └── use-toast.ts          # Toast notifications
└── lib/
    ├── storage.ts            # In-memory storage
    ├── types.ts              # TypeScript types
    └── utils.ts              # Utility functions
```

## 🎨 Theme

Type Royale features a vibrant **neon dark mode** theme:

- **Primary Color**: Purple/Magenta (`#C77DFF`)
- **Accent Color**: Neon Green (`#00FF85`)
- **Background**: Dark gray with subtle gradients
- **Effects**: Glowing text, pulsing shadows, smooth animations

## 💾 How It Works (Technical)

### Storage Architecture

The app uses **in-memory storage** on Vercel serverless functions:

1. **Games are stored** in a JavaScript `Map()` object
2. **State persists** during the serverless function's lifetime (~5 minutes)
3. **Polling** updates the client every 500ms for real-time feel
4. **No database** required - perfect for demos and quick games

### Important Notes

⚠️ **Game State Persistence**:
- Games exist in memory and will be lost if:
  - The serverless function goes cold (~5 min of inactivity)
  - You redeploy your app
  - Vercel scales down the function

✅ **This is perfect for**:
- Quick games with friends
- Demo/testing purposes
- Low-traffic usage
- No-config deployments

🔄 **For production with persistence**, consider adding:
- Vercel KV (Redis)
- Vercel Postgres
- Or any database of your choice

## 🔧 Customization

### Change Theme Colors

Edit `src/app/globals.css`:

```css
.dark {
  --primary: 276 100% 75%; /* Change to your color! */
  --accent: 128 100% 52%;
}
```

### Add More Text Snippets

Edit `src/app/api/games/[gameId]/start/route.ts`:

```typescript
const TEXT_SNIPPETS = [
  'Your custom text here...',
  'Add as many as you want!',
];
```

### Change Player Limit

Search for `>= 3` in the codebase and change to your desired limit.

### Adjust Polling Rate

Edit `src/hooks/use-game.ts`:

```typescript
const interval = setInterval(fetchGame, 500); // Change to your preference (ms)
```

## 🐛 Troubleshooting

**Game not loading?**
- Hard refresh (Ctrl+Shift+R)
- Check browser console for errors
- Make sure dev server is running

**Players not syncing?**
- Wait a moment (polling is every 500ms)
- Check if all players are on the same URL
- Refresh the page

**Game disappeared?**
- Serverless function went cold (restart the game)
- This is expected with in-memory storage
- For persistence, add a database

**State out of sync?**
- All players should refresh
- Create a new room if needed
- Consider adding Vercel KV for production

## 📊 API Reference

### Create Game
```
POST /api/games
Body: { playerName: string }
Returns: { roomId, playerId, game }
```

### Join Game
```
POST /api/games/[gameId]/join
Body: { playerName: string }
Returns: { playerId, game }
```

### Get Game
```
GET /api/games/[gameId]
Returns: Game object
```

### Update Game
```
PATCH /api/games/[gameId]
Body: Partial<Game>
Returns: Updated game
```

### Update Player
```
PATCH /api/games/[gameId]/update-player
Body: { playerId, updates: Partial<Player> }
Returns: Updated game
```

### Start Game
```
POST /api/games/[gameId]/start
Returns: Updated game with countdown state
```

### Reset Game
```
POST /api/games/[gameId]/reset
Returns: Reset game in waiting state
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or use the web interface:
1. Push to GitHub
2. Import in Vercel
3. Deploy!

### Other Platforms

The app works on any platform that supports Next.js:
- Netlify
- Railway
- Render
- Self-hosted

## 🔮 Upgrading to Persistent Storage

Want your games to persist? Add Vercel KV:

1. Enable Vercel KV in your project settings
2. Install `@vercel/kv`: `npm install @vercel/kv`
3. Update `src/lib/storage.ts` to use KV instead of Map
4. Redeploy!

Example KV integration:

```typescript
import { kv } from '@vercel/kv';

export const storage = {
  getGame: (id: string) => kv.get<Game>(`game:${id}`),
  setGame: (id: string, game: Game) => kv.set(`game:${id}`, game),
  // etc...
};
```

## 📝 License

MIT License - feel free to use this project for learning or building your own typing game!

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Deployed on [Vercel](https://vercel.com/)

---

**Happy typing!** 🎉⌨️🚀

**No Firebase, No Database, No Config - Just Pure Fun!**
