# Vercel Deployment Setup Guide 🚀

This guide explains how to set up persistent storage for your Type Royale game on Vercel using Vercel KV.

---

## 🔴 Why You Need This

**The Problem:**
- In-memory storage works in development (localhost)
- But Vercel uses serverless functions that reset between requests
- **Games disappear immediately** without persistent storage!

**The Solution:**
- Use Vercel KV (Redis) for persistent storage
- It's built into Vercel, easy to set up, and free tier available

---

## 📋 Setup Steps

### Step 1: Create a Vercel KV Database

1. **Go to your Vercel Dashboard**
   - Navigate to https://vercel.com/dashboard

2. **Go to Storage Tab**
   - Click on "Storage" in the top menu
   - Click "Create Database"

3. **Select KV (Redis)**
   - Choose "KV" from the available options
   - Click "Continue"

4. **Name Your Database**
   - Enter a name: `type-royale-kv` (or any name you prefer)
   - Select your region (choose closest to your users)
   - Click "Create"

5. **Connect to Your Project**
   - Select your Type Royale project from the list
   - Click "Connect"

---

### Step 2: Environment Variables (Automatic!)

**Good news:** Vercel automatically adds these environment variables to your project:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

You don't need to manually copy/paste anything! ✅

To verify:
1. Go to your project settings
2. Click "Environment Variables"
3. You should see the KV variables listed

---

### Step 3: Deploy (or Redeploy)

If you already deployed:
1. Go to your project's "Deployments" tab
2. Click the three dots (...) on the latest deployment
3. Click "Redeploy"

If this is your first deployment:
```bash
git push origin main
```

Vercel will automatically deploy! 🎉

---

## ✅ Verification

Once deployed, test it:

1. **Create a Game**
   - Go to your deployed URL
   - Create a new game
   - Note the room ID

2. **Test Persistence**
   - Open the room in a new tab
   - The game should still exist!
   - Previously, it would show "Game not found"

3. **Check Logs**
   - In Vercel Dashboard > your project > Logs
   - You should see `[Storage-KV]` messages instead of `[Storage-Memory]`

---

## 🔧 How It Works

### Development (localhost)
```
Storage Mode: In-Memory
- Uses JavaScript Map
- Fast and simple
- Resets on server restart
- Perfect for development
```

### Production (Vercel)
```
Storage Mode: Vercel KV (Redis)
- Persistent across serverless functions
- Automatic expiration (24 hours)
- Fast Redis performance
- Shared across all function invocations
```

The app automatically detects which mode to use based on environment variables!

---

## 💾 Data Persistence

### Automatic Expiration
- Games automatically expire after **24 hours**
- This keeps your database clean
- No manual cleanup needed

### Manual Cleanup
If you want to clear all games:
1. Go to Vercel Dashboard > Storage > your KV database
2. Click "Data Browser"
3. Search for `game:*`
4. Delete old games manually

---

## 🆓 Free Tier Limits

Vercel KV Free Tier includes:
- **256 MB** storage
- **10,000 commands/day**
- **100 concurrent connections**

For a typing game, this is more than enough! Each game:
- Uses ~5 KB of storage
- Free tier = ~50,000 games
- Commands = read/write operations (well within limits)

---

## 🐛 Troubleshooting

### Games Still Disappearing?

**Check Environment Variables:**
```bash
# In your Vercel project settings
KV_REST_API_URL=https://...    ✅ Should exist
KV_REST_API_TOKEN=...           ✅ Should exist
```

**Check Logs:**
```
# Should see KV logs in production
[Storage-KV] Getting game: ABC123  ✅ Good
[Storage-Memory] Getting game: ... ❌ Wrong in production
```

**Solution:**
1. Verify KV database is connected to your project
2. Redeploy your application
3. Check that environment variables are set

---

### "Game not found" Errors?

This can happen if:
1. KV database isn't connected → Follow Step 1 again
2. Environment variables missing → Check Step 2
3. App not redeployed → Run Step 3
4. Game actually expired (24h old) → Normal behavior

---

### KV Connection Errors?

Check the error in Vercel Logs:
```
"Failed to connect to KV" → Check your internet/Vercel status
"Invalid credentials" → Re-create environment variables
"Rate limit exceeded" → Upgrade plan or wait for reset
```

---

## 📊 Monitoring

### Check KV Usage
1. Vercel Dashboard > Storage > your KV database
2. View analytics:
   - Total keys (active games)
   - Commands used (requests made)
   - Memory usage

### Performance Tips
- Games auto-expire (24h) to save space
- Each game ~5 KB
- Can store thousands of games on free tier

---

## 🔐 Security

### API Tokens
- Tokens are automatically managed by Vercel
- Never commit `.env` files to Git
- Vercel encrypts all environment variables

### Data Privacy
- Games are stored in Redis (fast, secure)
- No personal data is stored
- Only game state (WPM, progress, etc.)

---

## 🚀 Advanced Configuration

### Custom TTL (Time to Live)
Default: 24 hours

To change, edit `src/lib/storage.ts`:
```typescript
const GAME_TTL = 12 * 60 * 60; // 12 hours instead of 24
```

### Different Regions
When creating KV database, choose:
- **US East** - Best for US users
- **EU West** - Best for European users
- **Asia** - Best for Asian users

---

## 📝 Summary Checklist

Before deploying:
- [✅] Vercel KV database created
- [✅] Database connected to project
- [✅] Environment variables auto-set
- [✅] Application deployed/redeployed
- [✅] Tested game creation and persistence

After deploying:
- [✅] Games persist across page reloads
- [✅] Multiple players can join
- [✅] Logs show `[Storage-KV]` messages
- [✅] No "Game not found" errors

---

## 🎯 Quick Commands

```bash
# Install dependencies
npm install

# Test locally (uses in-memory storage)
npm run dev

# Build for production
npm run build

# Check for errors
npm run lint
npm run type-check

# Deploy to Vercel
git push origin main
```

---

## 📞 Need Help?

1. **Check Vercel Docs**: https://vercel.com/docs/storage/vercel-kv
2. **Check Logs**: Vercel Dashboard > Logs
3. **Check this guide**: Re-read troubleshooting section

---

**Your app is now production-ready with persistent storage! 🎉**

Games will persist, multiple users can join, and everything works in serverless! 🚀

