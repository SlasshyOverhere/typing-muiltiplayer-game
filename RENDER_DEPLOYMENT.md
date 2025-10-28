# 🚀 Deploy Backend to Render (Simple & Free!)

## Why This Works Better

❌ **Vercel Serverless:** Memory resets between requests → Games disappear  
✅ **Render Web Service:** Server runs continuously → Games persist  

No KV database needed, no bullshit. Just works! 💪

---

## 📋 Step-by-Step Deployment

### Step 1: Commit Backend to GitHub

```bash
git add backend/
git commit -m "Add Express backend for game storage"
git push origin main
```

### Step 2: Deploy on Render

1. **Go to Render Dashboard**
   - Visit: https://render.com/dashboard
   - Sign up/Login (free account)

2. **Create New Web Service**
   - Click **"New +"** button (top right)
   - Select **"Web Service"**

3. **Connect Repository**
   - Click **"Connect account"** → Select GitHub
   - Find your repository: `typing-muiltiplayer-game`
   - Click **"Connect"**

4. **Configure Service**
   
   Fill in these details:
   
   - **Name:** `type-royale-backend` (or whatever you want)
   - **Region:** Choose closest to your users (e.g., `Oregon (US West)`)
   - **Branch:** `main`
   - **Root Directory:** `backend` ⚠️ **IMPORTANT!**
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

5. **Click "Create Web Service"**
   
   Wait 2-3 minutes for deployment...

6. **Get Your Backend URL**
   
   Once deployed, you'll see your URL:
   ```
   https://type-royale-backend.onrender.com
   ```
   
   Test it:
   ```
   https://type-royale-backend.onrender.com/api/health
   ```
   
   Should return: `{"status":"ok","gamesActive":0,"uptime":...}`

---

## 🔧 Step 3: Update Frontend to Use Backend

### Option A: Update API Routes (Recommended)

Replace all your Next.js API route calls with the backend URL.

1. **Find all fetch calls in your code:**
   ```javascript
   // OLD (Next.js API routes)
   fetch('/api/games')
   fetch(`/api/games/${roomId}`)
   fetch(`/api/games/${roomId}/join`)
   ```

2. **Replace with backend URL:**
   ```javascript
   // NEW (Render backend)
   const API_URL = 'https://type-royale-backend.onrender.com';
   
   fetch(`${API_URL}/api/games`)
   fetch(`${API_URL}/api/games/${roomId}`)
   fetch(`${API_URL}/api/games/${roomId}/join`)
   ```

### Option B: Use Environment Variable (Better)

1. **Create `.env.local` file in root:**
   ```bash
   NEXT_PUBLIC_API_URL=https://type-royale-backend.onrender.com
   ```

2. **Use in your code:**
   ```javascript
   const API_URL = process.env.NEXT_PUBLIC_API_URL;
   fetch(`${API_URL}/api/games`)
   ```

---

## 📝 Files to Update

### 1. `src/hooks/use-game.ts`

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const fetchGame = useCallback(async () => {
  if (!roomId) return;
  
  try {
    const response = await fetch(`${API_URL}/api/games/${roomId}`);
    // ... rest of code
  }
}, [roomId]);
```

### 2. `src/components/game/TypingGame.tsx`

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Update progress
await fetch(`${API_URL}/api/games/${game.id}/update-player`, {
  method: 'PATCH',
  // ... rest
});
```

### 3. `src/components/game/GameResults.tsx`

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

await fetch(`${API_URL}/api/games/${roomId}`, {
  method: 'PATCH',
  // ... rest
});
```

### 4. `src/app/game/[roomId]/GameContainer.tsx`

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

await fetch(`${API_URL}/api/games/${roomId}`, {
  method: 'PATCH',
  // ... rest
});
```

---

## 🎯 Quick Search & Replace

**Find in all files:** `/api/games`  
**Replace with:** `${process.env.NEXT_PUBLIC_API_URL}/api/games`

Then add to `.env.local`:
```
NEXT_PUBLIC_API_URL=https://type-royale-backend.onrender.com
```

---

## ✅ Verification Checklist

After deployment:

- [ ] Backend deployed on Render
- [ ] Health check URL works: `/api/health`
- [ ] Frontend `.env.local` created with backend URL
- [ ] All `/api/*` calls updated to use `API_URL`
- [ ] Frontend redeployed on Vercel
- [ ] Test creating a game
- [ ] Test joining a game
- [ ] Test playing a game
- [ ] Games persist (no "Game not found" errors!)

---

## 🐛 Troubleshooting

### Backend URL not working?

Check Render logs:
1. Render Dashboard → Your service
2. Click **"Logs"** tab
3. Look for errors

### CORS errors in browser?

The backend allows all origins by default. If you see CORS errors:
1. Check browser console for exact error
2. Backend logs should show the request
3. Make sure you're using HTTPS in production

### Games still disappearing?

**Important:** Render free tier spins down after 15 minutes of inactivity!

**Solutions:**
1. **Upgrade to paid tier** ($7/month) - keeps server running 24/7
2. **Accept cold starts** - First request after spin-down takes ~30 seconds
3. **Use Render cron job** to ping your backend every 14 minutes (keeps it awake)

### Creating a keep-alive cron job:

1. Render Dashboard → **"New +"** → **"Cron Job"**
2. **Command:** `curl https://type-royale-backend.onrender.com/api/health`
3. **Schedule:** `*/14 * * * *` (every 14 minutes)
4. This keeps your server awake on free tier!

---

## 💰 Pricing

### Free Tier
- ✅ 750 hours/month (enough for one service)
- ✅ Automatic HTTPS
- ✅ Auto-deploy from GitHub
- ⚠️ Spins down after 15 min inactivity
- ⚠️ First request after spin-down: ~30 sec

### Starter Tier ($7/month)
- ✅ Always running (no spin-down)
- ✅ Instant response times
- ✅ Everything in free tier

For a typing game, **free tier is fine** with the keep-alive cron job!

---

## 🎉 Summary

1. **Push backend code** to GitHub
2. **Create Render web service** (2 minutes)
3. **Update frontend** to use backend URL
4. **Deploy frontend** to Vercel
5. **Done!** Games now persist properly! ✅

**No serverless bullshit. No KV setup. Just works!** 🚀

---

## 📞 Next Steps

1. Deploy backend to Render (follow steps above)
2. Get your backend URL
3. Update frontend environment variable
4. Test everything works
5. Celebrate! 🎉

Need help? Check Render docs: https://render.com/docs

