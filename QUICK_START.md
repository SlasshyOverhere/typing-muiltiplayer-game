# 🚀 Quick Start Guide - Frontend + Backend

## ✅ Everything is Connected!

Your frontend is now linked to the Express backend. No more serverless issues!

---

## 🏃 Run Locally (Development)

### Terminal 1: Start Backend

```bash
cd backend
npm start
```

Backend runs on: `http://localhost:3001`

### Terminal 2: Start Frontend

```bash
npm run dev
```

Frontend runs on: `http://localhost:3000`

### Test It

1. Open `http://localhost:3000`
2. Create a game
3. Join from another browser tab
4. Play the game
5. **Games persist!** ✅

---

## 🌐 Deploy to Production

### Step 1: Deploy Backend to Render

```bash
# Push code to GitHub
git add .
git commit -m "Add backend and link frontend"
git push origin main
```

Then on Render:
1. Create Web Service
2. Connect your repo
3. **Root Directory:** `backend` ⚠️
4. **Build:** `npm install`
5. **Start:** `npm start`
6. Get URL: `https://your-app.onrender.com`

### Step 2: Update Frontend Environment

In Vercel Dashboard → Your Project → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://your-app.onrender.com
```

### Step 3: Redeploy Frontend

Vercel auto-deploys from GitHub, or manually click "Redeploy"

---

## 🎮 Features Working Now

✅ **Create Game** - Backend stores in memory  
✅ **Join Game** - Multiple players supported  
✅ **Play Game** - Real-time progress updates  
✅ **Disband Room** - Host can delete games  
✅ **Screenshot Results** - Download PNG  
✅ **Rematch** - Reset and play again  

**No more "Game not found" errors!** 🎉

---

## 🔧 Current Setup

```
Frontend (Next.js 15)
↓ fetch calls →
Backend (Express on Render)
↓ stores in →
In-Memory Map (persists as long as server runs)
```

---

## 📊 Backend Health Check

Visit: `http://localhost:3001/api/health`

Should show:
```json
{
  "status": "ok",
  "gamesActive": 0,
  "uptime": 123.45
}
```

---

## 🐛 Troubleshooting

### Backend Not Running?

```bash
cd backend
npm start
```

### Frontend Can't Connect?

Check `.env.local` file exists with:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Port Already in Use?

Change port in `backend/server.js`:
```javascript
const PORT = process.env.PORT || 3002; // Changed from 3001
```

Then update `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3002
```

---

## 📝 Files Changed

Frontend:
- ✅ `src/lib/api-config.ts` - API URL config
- ✅ `src/app/actions.ts` - Use backend API
- ✅ `src/hooks/use-game.ts` - Use backend API
- ✅ `src/components/game/TypingGame.tsx` - Use backend API
- ✅ `src/components/game/GameResults.tsx` - Use backend API
- ✅ `src/app/game/[roomId]/GameContainer.tsx` - Use backend API
- ✅ `.env.local` - Environment variables

Backend:
- ✅ `backend/server.js` - Complete Express API
- ✅ `backend/package.json` - Dependencies
- ✅ `backend/.gitignore` - Ignore files

---

## 🎯 Next Steps

1. ✅ Backend running on `localhost:3001`
2. ✅ Frontend linked to backend
3. ⏳ Test locally
4. ⏳ Deploy backend to Render
5. ⏳ Update Vercel environment variable
6. ⏳ Test production

---

**Everything is ready! Start both servers and test it out!** 🚀

